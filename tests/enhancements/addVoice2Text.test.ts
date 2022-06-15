import {skip} from '../helpers.ts'
import {readToString} from '../../src/lib/utils/pumpReader.ts'
import {textToVoice, text2VoiceParams, makeKey, isMediaFinished, haveEverStarted, cacheOurBreadcrumbs } from '../../src/lib/enhancements/addText2voice.ts'
import {parseAndPickType} from '../../src/lib/start.ts'
import {type ASTjson, type ASTcomputable, rezVal, ASTFeedItemJson, ASTKindComputable, computableToJson} from '../../src/lib/parsers/ast.ts'
import {jsonFeed} from '../mocks/jsonFeed/daringFireball.ts'

import { S3Bucket } from "https://deno.land/x/s3@0.5.0/mod.ts";
import { readableStreamFromReader  } from "https://deno.land/std@0.125.0/streams/conversion.ts";
import { StringReader } from "https://deno.land/std@0.125.0/io/mod.ts";
import { assertEquals, assertNotEquals } from 'https://deno.land/std@0.123.0/testing/asserts.ts';

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
        assertEquals('url' in attach && attach.url, true, 'All items should have a url')
        assertEquals('title' in attach && attach.title, true, 'All items should have attachment')
        assertEquals('mimeType' in attach && attach.mimeType, true, 'All items should have attachment')
        assertEquals(attach.sizeInBytes ?? 0 >= 0 , true, 'All items should have attachment')
        assertEquals(attach.durationInSeconds ?? 0 >=0 , true, 'All items should have attachment')
    }
}

const s3stateGlobal = new Map<string, unknown>()

const s3Mock = (state: Map<string, unknown> = new Map<string, unknown>())=>({
    getObject : async (key: string)=>{
        return { body: readableStreamFromReader(new StringReader(JSON.stringify( state.get(key) ))) } 
    },
    putObject: async (key: string, data:unknown)=>{
        state.set(key, data)
        return state.get(key)
    }
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


Deno.test('readToString', async ()=>{
    const input = 'Hello'
    const rsInput = readableStreamFromReader(new StringReader(input))
    const collected = await readToString(rsInput)
    assertEquals(input, collected)
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
    console.log({hasStarted})
    assertEquals(hasStarted && true, true)

})

Deno.test('isMediaFinished is based on bread crumbs', async ()=>{    
    const s3m = s3Mock() as unknown as S3Bucket
    const key = '1234'
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

    const status : "completed" |  "failed" |  "inProgress" | "scheduled" = 'inProgress'
    const savedData = await cacheOurBreadcrumbs( 
        item,
        key, 
        {
            SynthesisTask:{
                TaskStatus:status, 
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
    assertEquals('sk' in savedData, true)
    assertEquals('pk' in savedData, true)
    assertEquals('item' in savedData, true)
    assertEquals('task' in savedData, true)

    const hasStarted = await haveEverStarted(key,s3m)
    
    if(hasStarted){
        const isFinished = isMediaFinished(hasStarted)
        assertEquals(isFinished, true)
    }
    assertEquals(hasStarted && true, true)
})

Deno.test(skip('cacheOurBreadcrumbs will saves at least the minimum set', async ()=>{}))

Deno.test(skip('example', async ()=>{}))