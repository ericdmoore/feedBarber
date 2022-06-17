import {skip} from '../helpers.ts'
import {readToString, streamToString, readStream} from '../../src/lib/utils/pumpReader.ts'
import {textToVoice, text2VoiceParams, makeKey, isMediaFinished, haveEverStarted, cacheOurBreadcrumbs } from '../../src/lib/enhancements/addVoice2text.ts'
import {parseAndPickType} from '../../src/lib/start.ts'
import {type ASTjson, type ASTcomputable, rezVal, ASTFeedItemJson, ASTKindComputable, computableToJson} from '../../src/lib/parsers/ast.ts'
import {jsonFeed} from '../mocks/jsonFeed/daringFireball.ts'

import { S3Bucket } from "https://deno.land/x/s3@0.5.0/mod.ts";
import { readableStreamFromReader, readableStreamFromIterable  } from "https://deno.land/std@0.144.0/streams/conversion.ts";
import { StringReader } from "https://deno.land/std@0.144.0/io/mod.ts";
import { assertEquals, assertNotEquals } from 'https://deno.land/std@0.144.0/testing/asserts.ts';

// const sw = new StringWriter('')


type AST = ASTjson | ASTcomputable
type ASTItem =  typeof ASTFeedItemJson.TYPE

const runAssertions = (...ASTassertionFns: ((ast: AST)=>Promise<void>)[]) => (...itemAssertionFns: ((item:ASTItem)=>Promise<void>)[]) => async (ast: AST)=>{
    const _ast = await computableToJson(ast)
    const list = _ast.items
    for(const fAssert of ASTassertionFns){
        fAssert(ast)
    }
    for(const item of list){
        for(const fAssert of itemAssertionFns){
            fAssert(item)
        }
    }
}

const testItemHasAttachments = async (item:ASTItem)=>{
    const attached = await rezVal(item.attachments)
    assertEquals(attached.length > 0, true, 'All items should have attachment')
}

const testItemHasValidAttachments = async (item:ASTItem)=>{
    const attached = await rezVal(item.attachments)
    for(const attach of attached){
        assertEquals('url' in attach && attach.url && true, true, 'All items should have a url')
        assertEquals('title' in attach && attach.title && true, true, 'All items should have attachment')
        assertEquals('mimeType' in attach && attach.mimeType && true, true, 'All items should have attachment')
        assertEquals(attach.sizeInBytes ?? 0 >= 0 , true, 'All items should have attachment')
        assertEquals(attach.durationInSeconds ?? 0 >=0 , true, 'All items should have attachment')
    }``
}

const encoder = new TextEncoder()
const s3stateGlobal = new Map<string, Uint8Array>()

const s3Mock = (state: Map<string, Uint8Array> = new Map<string, Uint8Array>())=>({
    putObject: async (key: string, data: object | string | Uint8Array):Promise<Uint8Array>=>{ 
        const val = typeof data ==='string' 
            ? encoder.encode(data) 
            : data instanceof Uint8Array
                ? data
                : encoder.encode(JSON.stringify(data)) 
        state.set(key, val)
        return val
    },
    getObject : async (key: string)=>{
        const data = state.get(key)
        let idx = 0
        if(data){
            return { body: new ReadableStream({ 
                pull: (ctlr)=>{
                    const size =  ctlr.desiredSize ?? 32
                    const d = data.slice(idx,size )
                    ctlr.enqueue(d)
                    idx = idx + size
                    if(d.length  ===  0 || d.length < size){
                        ctlr.close()
                    }
                },
            }) }
        }else{
            return Promise.reject({err:'Object Not Found', code: 404})
        }
    },
})


Deno.test('test', async()=>{
    const dataStr = JSON.stringify({a:1, b:2, c:'c', d:{e:5, f:null}})
    const strR = new StringReader(dataStr)
    const rs0  = readableStreamFromReader(strR)
    const [rs1, rs2] = readableStreamFromReader(strR).tee()

    console.log('await readToString(rs)', JSON.parse(await readToString(rs1)) )
    console.log('streamToString(rs)', await streamToString(rs0))
    console.log("readStream(rs)", await readStream(rs2))
})

Deno.test('readToString', async ()=>{
    const input = 'Hello'
    const rsInput = readableStreamFromReader(new StringReader(input))
    const collected = await readToString(rsInput)
    assertEquals(input, collected)
})

Deno.test(skip('Homomorphic Enhancement', async ()=>{
    const addTextFn = textToVoice({aws:{key:'NEVER REPLACE', region:'US-WEST-2', secret:'NEVER REPLACE', iamUserName:''}, config:{s3:{bucket:'testBucket', prefix:''}}})
    const r = parseAndPickType({ url:'', txt: jsonFeed })
    const ast = await computableToJson(r.parser(r.data, r.url).toAST())
    const astWithAttachment = await computableToJson(addTextFn(ast))
    const [err, data] = ASTKindComputable.validate(astWithAttachment)
    assertEquals(err, undefined)
    assertEquals(data && true, true)    
}))

Deno.test(skip('Valid Attachment For each entry ', async ()=>{
    const r = parseAndPickType({ url:'', txt: jsonFeed })
    const ast = await r.parser(r.data, r.url).toAST()
    const addTextFn = textToVoice({aws:{key:'', region:'', secret:'', iamUserName:''}, config:{s3:{bucket:'testBucket', prefix:''}}})
    const astWithAttachment = await addTextFn(ast)
    runAssertions()(testItemHasAttachments, testItemHasValidAttachments)(astWithAttachment)
}))

Deno.test(skip( 
    'Enhancement will Validate Params', async ()=>{
            const r = parseAndPickType({ url:'', txt: jsonFeed })
            const ast = await r.parser(r.data, r.url).toAST()
            const addTextFn = textToVoice({aws:{key:'', region:'', secret:'', iamUserName:''}, config:{s3:{bucket:'testBucket', prefix:''}}})
            const astWithAttachment = await addTextFn(ast)
            runAssertions()(testItemHasAttachments, testItemHasValidAttachments)(astWithAttachment)
        }
    )
)

Deno.test('makeKey changes for config + corpus', async ()=>{
    const [t1a, t2a, t1b ] = await Promise.all([
        makeKey({a:1}, 'itemText'),
        makeKey({a:2}, 'itemText'),
        makeKey({a:1}, 'item Text')
    ])
    assertNotEquals(t1a, t2a)
    assertNotEquals(t1a, t1b)
    assertNotEquals(t1b, t2a)
})



Deno.test('S3 Mock Unit Test', async ()=>{
    const s3m = s3Mock()
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    const data = {a:1, b:2, c:{d:4, e:5}}
    const dataEcho = await s3m.putObject( 'someKey',  data )
    
    const fromS3Mock = await (await s3m.getObject('someKey')).body
    console.log('>> fromS3Mock :: ',fromS3Mock)
    console.log('>> await readToString(fromS3Mock) :: ', await readToString(fromS3Mock))

        
    console.log('>> decoded - dataEcho: ', JSON.parse(decoder.decode(dataEcho as Uint8Array)))
    // console.log('>> here it is - streamToString:: ', await streamToString(await (await s3m.getObject('someKey')).body))
    // console.log(fromS3Mock)

    // assertEquals(data, dataEcho)
    // assertEquals(data, fromS3Mock)
})

Deno.test('haveEverStarted is based on breadcrumbs', async ()=>{
    const s3m = s3Mock() as unknown as S3Bucket
    const key = 'abcd'
    const url = `https://example.com/${key}`
    const item = {
        title:'example', 
        url,
        id:url,
        authors:[{name:'Eric', imageUri:'http://example.com'}], 
        content:{text:'Some Text'}, 
        images:{bannerImage:'', indexImage:''},
        links:{category:'', nextPost:'', prevPost:'', externalURLs:[], tags:[]},
        attachments:[], 
        dates:{modified: Date.now(), published: Date.now()}, 
    }
    const savedData = await cacheOurBreadcrumbs( 
        item, 
        key, 
        {
            SynthesisTask:{
                TaskStatus: 'inProgress',
                TaskId: '',
                CreationTime: (new Date().getTime()), 
                OutputFormat: 'mp3', 
                OutputUri:'',
                Engine: 'neural',
                LanguageCode: 'en-US',
                LexiconNames: ['english'],
                SampleRate: '24000',
                VoiceId:'Matthew',
                TextType:'text',
                TaskStatusReason:'',
                SnsTopicArn:'',
                RequestCharacters: 42,
                SpeechMarkTypes:['sentence']
            },
            
        }, 
        s3m 
    )
    const hasStarted = await haveEverStarted(key,s3m)
    // console.log({hasStarted})
    assertEquals(hasStarted && true, true)

})

Deno.test('isMediaFinished is based on bread crumbs', async ()=>{    
    const s3m = s3Mock() as unknown as S3Bucket

    const itemNum = 1234    
    const url = `https://example.com/${itemNum}`
    const item = {
        title:'example', 
        url,
        id:url,
        authors:[{name:'Eric', imageUri:'http://example.com'}], 
        content:{text:'Some Text that will end up in an S3 bucket... but their will also be a meta data object that exists in another s3 location'}, 
        images:{bannerImage:'', indexImage:''},
        links:{category:'', nextPost:'', prevPost:'', externalURLs:[], tags:[]},
        attachments:[], 
        dates:{modified: Date.now(), published: Date.now()}, 
    }
    const status : "completed" |  "failed" |  "inProgress" | "scheduled" = 'inProgress'
    
    const key = await makeKey(item, item.content.text)
    const breadCrumbs = await cacheOurBreadcrumbs( 
        item,
        key, 
        {
            SynthesisTask:{
                TaskStatus: status, 
                TaskId:'a1b2c3d4', 
                CreationTime: Date.now(), 
                OutputFormat: 'mp3', 
                OutputUri: 'https://audio.example.com/1234',
                Engine: 'neural',
                LanguageCode: 'en-US',
                LexiconNames: [''],
                RequestCharacters: 42,
                SampleRate: '24000',
                SnsTopicArn: '',
                SpeechMarkTypes:['sentence'],
                TaskStatusReason: '',
                TextType: 'text',
                VoiceId: 'Matthew'
                 
            },
        }, 
        s3m 
    )

    console.log('item: ', breadCrumbs.item)
    console.log('sk: ', breadCrumbs.sk)

    const hasStarted = await haveEverStarted(key, s3m)
    console.log( 'truthy?', !!hasStarted )
    console.log( 'hasStarted: ', hasStarted )
    console.log( 'task: ', hasStarted?.task )

    assertEquals('sk' in breadCrumbs, true)
    assertEquals('pk' in breadCrumbs, true)
    assertEquals('item' in breadCrumbs, true)
    assertEquals('task' in breadCrumbs, true)
    
    // if(hasStarted){
    //     const isFinished = isMediaFinished(hasStarted)
    //     assertEquals(isFinished, true)
    // }
    // assertEquals(hasStarted && true, true)
})

Deno.test(skip('cacheOurBreadcrumbs will saves at least the minimum set', async ()=>{}))

Deno.test(skip('example', async ()=>{}))