import {skip} from '../helpers.ts'
import {readToString, streamToString, readStream} from '../../src/lib/utils/pumpReader.ts'
import {textToVoice, makeKey, haveEverStarted, isMediaFinished, cacheOurBreadcrumbs } from '../../src/lib/enhancements/addVoice2text.ts'
// isMediaFinished,text2VoiceParams,
import {parseAndPickType} from '../../src/lib/start.ts'
import {type ASTjson, type ASTcomputable, rezVal, ASTFeedItemJson, ASTKindComputable, computableToJson} from '../../src/lib/parsers/ast.ts'
import {jsonFeed} from '../mocks/jsonFeed/daringFireball.ts'

import { pollyClient } from '../../src/lib/client/aws-polly.ts'
import { s3Mock } from '../mocks/s3/s3Mock.ts'
import { S3Bucket } from "https://deno.land/x/s3@0.5.0/mod.ts";
import { readableStreamFromReader  } from "https://deno.land/std@0.144.0/streams/conversion.ts";
import { Buffer } from "https://deno.land/std@0.144.0/streams/mod.ts";
import { StringReader } from "https://deno.land/std@0.144.0/io/mod.ts";
import { assertEquals, assertNotEquals } from 'https://deno.land/std@0.144.0/testing/asserts.ts';

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
    }
}

const encoder = new TextEncoder()
const s3stateGlobal = new Map<string, Uint8Array>()

Deno.test('streamToString', async()=>{
    const data = {a:1, b:2, c:'c', d:{e:5, f:null}}
    const dataStr = JSON.stringify(data)
    const strR = new StringReader(dataStr)
    const rs0  = readableStreamFromReader(strR)
    
    const s0 = await streamToString(rs0)
    // console.log('await streamToString(rs)', s0 )
    
    const o0 = JSON.parse(s0)
    // console.log(o0)
    assertEquals(o0, data)

    // console.log('await readToString(rs)', await readToString(rs1)) 
    // console.log("await readStream(rs)", await readStream(rs2))
})

Deno.test('readToString', async ()=>{
    const input = 'Hello'
    const rsInput = readableStreamFromReader(new StringReader(input))
    const collected = await readToString(rsInput)
    assertEquals(input, collected)
})

Deno.test(skip('Homomorphic Enhancement', async ()=>{
    const r = parseAndPickType({ url:'', txt: jsonFeed })
    const ast = await computableToJson(r.parser(r.data, r.url).toAST())

    const addTextFn = textToVoice(
        {
            aws:{
                region:'US-WEST-2', 
                key:'NEVER REPLACE', 
                secret:'NEVER REPLACE', 
            }, 
            config:{
                s3:{
                    bucket:'testBucket', 
                    prefix:''}
            }
        },        
    )
  
    const astWithAttachment = await computableToJson(addTextFn(ast))
    const [err, data] = ASTKindComputable.validate(astWithAttachment)
    assertEquals(err, undefined)
    assertEquals(data && true, true)    
}))

Deno.test('Valid Attachment For each entry ', async ()=>{
    const r = parseAndPickType({ url:'', txt: jsonFeed })
    const ast = await r.parser(r.data, r.url).toAST()
    const addTextFn = textToVoice(
        {
            aws:{
                key:'', 
                region:'', 
                secret:'', 
                iamUserName:''
            }, 
            config:{
                    s3:{ bucket:'testBucket', prefix:'' }
            }
        }
    )
    const astWithAttachment = await addTextFn(ast)
    runAssertions()(testItemHasAttachments, testItemHasValidAttachments)(astWithAttachment)
})

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
    
    const rSFromS3Mock = await (await s3m.getObject('someKey')).body
    // console.log('>> fromS3Mock :: ',rSFromS3Mock)
    
    const s3DataStr = await streamToString(rSFromS3Mock)
    // console.log('>> await readToString(fromS3Mock) :: ', s3DataStr)

    const s3DataObj = JSON.parse(s3DataStr)
    // console.log('>> parsed data object :: ', s3DataObj)

    assertEquals(s3DataObj, data)
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
    
    const synthTask = {
        SynthesisTask:{
            TaskStatus: status, 
            TaskId:'a1b2c3d4', 
            CreationTime: Date.now(), 
            OutputFormat: 'mp3' as 'mp3',
            OutputUri: 'https://audio.example.com/1234',
            Engine: 'neural' as 'neural',
            LanguageCode: 'en-US' as 'en-US',
            LexiconNames: [''],
            RequestCharacters: 42,
            SampleRate: '24000',
            SnsTopicArn: '',
            SpeechMarkTypes:['sentence'] as ['sentence'],
            TaskStatusReason: '',
            TextType: 'text' as 'text',
            VoiceId: 'Matthew' as 'Matthew'
        }
    }

    const key = await makeKey(item, item.content.text)
    const breadCrumbs = await cacheOurBreadcrumbs(item, key, synthTask, s3m)
    const hasStarted = await haveEverStarted(key, s3m)
    
    assertEquals('sk' in breadCrumbs, true)
    assertEquals('pk' in breadCrumbs, true)
    assertEquals('item' in breadCrumbs, true)
    assertEquals('task' in breadCrumbs, true)
    
    if(hasStarted){
        const isFinished = await isMediaFinished(hasStarted)
        assertEquals(isFinished, false)
    }
    assertEquals(!!hasStarted, true)
})


Deno.test('isMediaFinished is now complete', async ()=>{    
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
    const status : "completed" |  "failed" |  "inProgress" | "scheduled" = 'completed'
    
    const synthTask = {
        SynthesisTask:{
            TaskStatus: status, 
            TaskStatusReason: '',
            TaskId:'a1b2c3d4', 
            CreationTime: Date.now(), 
            OutputFormat: 'mp3' as 'mp3',
            OutputUri: 'https://audio.example.com/1234',
            Engine: 'neural' as 'neural',
            LanguageCode: 'en-US' as 'en-US',
            LexiconNames: [''],
            RequestCharacters: 42,
            SampleRate: '24000',
            SnsTopicArn: '',
            SpeechMarkTypes:['sentence'] as ['sentence'],
            TextType: 'text' as 'text',
            VoiceId: 'Matthew' as 'Matthew'
        }
    }

    const key = await makeKey(item, item.content.text)
    const breadCrumbs = await cacheOurBreadcrumbs(item, key, synthTask, s3m)
    const hasStarted = await haveEverStarted(key, s3m)
    
    assertEquals('sk' in breadCrumbs, true)
    assertEquals('pk' in breadCrumbs, true)
    assertEquals(breadCrumbs.pk,  breadCrumbs.sk)
    assertEquals('item' in breadCrumbs, true)
    assertEquals('task' in breadCrumbs, true)
    assertEquals(!!hasStarted, true)

    if(hasStarted){
        const isFinished = await isMediaFinished(hasStarted)
        assertEquals(isFinished, true)
    }
})

Deno.test(skip('cacheOurBreadcrumbs will saves at least the minimum set', async ()=>{}))

Deno.test(skip('example', async ()=>{}))