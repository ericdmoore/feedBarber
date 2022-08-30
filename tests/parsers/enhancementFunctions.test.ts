import { assert, assertEquals,  } from 'https://deno.land/std@0.152.0/testing/asserts.ts';

import { 
    type FunctionPathBuilderInputDict,
    type FuncInterface,
    params,
    paramElement,
    legends,
    defaultedOptions,
    functions
} from '../../src/lib/parsers/enhancementFunctions.ts'

import hipsteripsum  from './helpers/hipsteripsum.ts'
import {encblubrSA, encblubrSBA} from './helpers/encTextBlurb.ts'


Deno.test('basic parse Legend', () => {
    const sba = legends.parse()('sba')
    assert(sba.right)
    assertEquals(sba.right, ['s','b','a'])

    const ma = legends.parse()('ma')
    assert(ma.right)
    assertEquals(ma.right, ['m','a'])

    const bad = legends.parse()('bad')
    assert(!bad.right)
    assert(bad.left)

    const jbgbga = legends.parse()('jbgbga')
    assert(jbgbga.right)
    assert(!jbgbga.left)
    assertEquals('jbgbga'.split(''), jbgbga.right)

    const jaa = legends.parse()('jaa')
    assert(!jaa.right)
    assert(jaa.left)
})

Deno.test('parse and Sort Legend', () => {
    const bas = legends.parse()('bas')
    assert(bas.right)
    assertEquals(bas.right, ['s','b','a'])
})

Deno.test('Pase Long Form Legend', () =>{
    const jba = legends.parse()('JSON,BR,B64')
    assert(jba.right)
    assertEquals(jba.right, ['JSON','BR','B64'])
})

Deno.test('validity requires 1only1 structure and 1only1 encoding legend keys', () => {
    assert(legends.isValid(['s','a']))
    assert(legends.isValid(['s','b','g','a'])) // albeit not practical
    assert(!legends.isValid(['b','a']))
    assert(!legends.isValid(['s','b']))
    assert(!legends.isValid(['s','j','b']))
})

Deno.test('SA encodeParams', () => {
    const legend = 'sa'    
    assertEquals( paramElement.stringify('sa')(null).right, 'null')
    assertEquals( paramElement.stringify('sa')(true).right, 'true')
    assertEquals( paramElement.stringify('sa')(false).right, 'false')
    assertEquals( paramElement.stringify('sa')(42).right, '42')
    assertEquals( paramElement.stringify('sa')(3005).right, '3005')
    assertEquals( paramElement.stringify('sa')(18.82).right, '18.82')
    assertEquals( paramElement.stringify('sa')("Hello World").right, 'sa::SGVsbG8gV29ybGQ=')
    assertEquals( paramElement.stringify('sa')(hipsteripsum).right, encblubrSA)
})

Deno.test('SA decodeParams', () => {
    assertEquals( paramElement.parse()('null').right, null)
    assertEquals( paramElement.parse()('true').right, true)
    assertEquals( paramElement.parse()('false').right, false)
    assertEquals( paramElement.parse()('42').right, 42)
    assertEquals( paramElement.parse()('3005').right, 3005)
    assertEquals( paramElement.parse()('ja::3005').right, 3005)
    assertEquals( paramElement.parse()('sa::3005').right, 3005)
    assertEquals( paramElement.parse()('18.82').right, 18.82)
    assertEquals( paramElement.parse()('::18.82').right, 18.82)
    assertEquals( paramElement.parse()('sa::SGVsbG8gV29ybGQ=').right, 'Hello World')
    assertEquals( paramElement.parse()( encblubrSA).right, hipsteripsum )
})

Deno.test('SBA encode decode', ()=>{
    const encSBA = paramElement.stringify('sba')(hipsteripsum)
    if(encSBA.left){
        console.error(encSBA.left)
        assert(!encSBA.left)
    }else{
        assert(encSBA.right.length < encblubrSA.length, 'Compressed SHOULD BE smaller than unencrypted')
        assertEquals(encSBA.right, encblubrSBA)
        assertEquals(paramElement.parse()(encSBA.right).right, hipsteripsum)
    }
})



Deno.test('encode + parse Param', ()=>{
    const params = {param1:true, param2:{a:1, b:null, c:'Hello World'}}
    const multiParamStr = 'param1=true&param2=ja::eyJhIjoxLCJiIjpudWxsLCJjIjoiSGVsbG8gV29ybGQifQ=='
    const encParamStr = paramElement.stringify('ja')(params)
    if(encParamStr.left){
        assert(!encParamStr.left)
    }else{
        const parsedParam = paramElement.parse()(encParamStr.right).right
        assertEquals(parsedParam, params)
    }
})


Deno.test('param parse', ()=>{
    const p1 = {param1:true, param2:{a:1, b:null, c:'Hello World'}}
    const r = params.parse()('param1=true&param2=ja::eyJhIjoxLCJiIjpudWxsLCJjIjoiSGVsbG8gV29ybGQifQ==')
    assert( !r.left )
    assertEquals( r.right, p1 )
})

Deno.test('param parse empty string', ()=>{
    const r = params.parse()('')
    assert( r.left  && !r.right )
})

Deno.test('Params stringify then parse ', ()=>{
    const p1 = {param1:true, param2:{a:1, b:null, c:'Hello World'}}
    const built = params.stringify()(p1)
    if(built.left){
        assert(!built.left)
    }else{
        const p2 = params.parse()(built.right)
        if(p2.left){
            assert(!p2.left)
        }else{
            assertEquals( p2.right, p1)
        }
    }
})


Deno.test('buildParams.1', ()=>{
    const p1 = {param1:true, param2:{a:1, b:null, c:'Hello World'}}
    assertEquals( 
        params.stringify()(p1).right, 
        'param1=true&param2=ja::eyJhIjoxLCJiIjpudWxsLCJjIjoiSGVsbG8gV29ybGQifQ=='
    )
})

Deno.test('buildParams.2', ()=>{
    const exampleParams = {example: {param1:true, param2:{a:1, b:null, c:'Hello World'}}}
    const r = params.stringify()(exampleParams)
    if(r.left){
        assert(!r.left)
    }else{
        assert(r.right)
        assertEquals(r.right, 'example=ja::eyJwYXJhbTEiOnRydWUsInBhcmFtMiI6eyJhIjoxLCJiIjpudWxsLCJjIjoiSGVsbG8gV29ybGQifX0=')
    }
})

Deno.test('buildFunctionString.1', ()=>{
    const exampleFunction = {exampleFn: {param1:true, param2:{a:1, b:null, c:'Hello World'}}}
    const r = functions.stringify()(exampleFunction)
    if(r.left){
        assert(!r.left)
    }else{
        assert(r.right)
        assertEquals(r.right, 'exampleFn(param1=true&param2=ja::eyJhIjoxLCJiIjpudWxsLCJjIjoiSGVsbG8gV29ybGQifQ==)')
    }
})

Deno.test('buildFunctionString.2', ()=>{
    const exampleFunctions = [
        {exampleFn1: {p1:true, p2:{a:1, b:null, c:'string'}}},
        {exampleFn2: {p1:true, p2:false, p3: null, p4: 'Hello World'}}
    ] as FunctionPathBuilderInputDict[]
    
    const r = functions.stringify()(...exampleFunctions)
    // console.log(r)

    if(r.left){
        assert(!r.left)
    }else{
        assert(r.right)
        assertEquals(r.right, 'exampleFn1(p1=true&p2=ja::eyJhIjoxLCJiIjpudWxsLCJjIjoic3RyaW5nIn0=)+exampleFn2(p1=true&p2=false&p3=null&p4=sa::SGVsbG8gV29ybGQ=)')
    }
})


Deno.test('example stringify works', ()=>{

    // NOTE params.stringify is hard coded so far
   const exampleJson = {
        _id: "630d2767f1f0781298f1e4e4",
        index: 0,
        guid: "b41f901b-0e2e-4262-a8a7-ed6b456ff5ac",
        isActive: true,
        balance: "$1,019.78",
        account: {
            company: "KEENGEN",
            profile: {
                about: "Pariatur ea pariatur reprehenderit cupidatat ea. Et reprehenderit officia duis mollit fugiat dolore. Magna labore quis Lorem occaecat mollit consequat ad aute fugiat aute culpa. Occaecat nulla excepteur consectetur ad nostrud nulla dolor proident cupidatat esse consequat sint. Sunt reprehenderit exercitation aliqua nulla deserunt occaecat cupidatat quis nostrud ut elit incididunt mollit. Tempor enim labore elit eu sint mollit Lorem dolor ipsum commodo ipsum sit quis in.\r\n",
                greeting: "Hello, Amber Quinn! You have 9 unread messages.",
                picture: "http://placehold.it/32x32",
                age: 24,
                eyeColor: "green",
                name: "Amber Quinn",
                gender: "female",
            },
            contact:{
                email: "amberquinn@keengen.com",
                phone: "+1 (894) 546-3501",
            },
            address: {
                street:"134 Clinton Avenue",
                city: 'Trexlertown',
                state:'Maryland',
                zip: "02210",
                raw: "134 Clinton Avenue, Trexlertown, Maryland, 02210",
            },
        },
        registered: "2014-08-28T08:03:45 +05:00",
        latitude: -48.818118,
        longitude: 170.288914,
        tags: [
            "reprehenderit",
            "aute",
            "fugiat",
            "culpa",
            "mollit",
            "est",
            "est"
        ],
        friends:[
            { "id": 0, "name": "Farrell Pugh" }, 
            { "id": 1, "name": "Horn Burns" }, 
            { "id": 2, "name": "Juarez Camacho" }
        ]
    }
    const r = params.stringify()(exampleJson)
    assert(r.right)
    assert(r.right.length <= 1159 )// using default compression should be better than jba - as of Mon Aug 29 17:25:08 CDT 2022
})

Deno.test('function.stringify + parse is bijective', ()=>{
  const finput = [
        {articlePicker:{cssSelector:'#SomeCssID'}},
        {addVoice:{
            s3: {
                bucket:'myawesomes3bucket',
                prefix:'thethingthatgoesbeforeeveryobject'.repeat(20)
            }, 
            polly: {
                voiceId: "Matthew",
                outputFormat: 'mp3',
                sampleRate: '2400',
                useNeuralEngine: true,
                isPlainText: true,
            },
        }}
    ] as FunctionPathBuilderInputDict[]

    const finterface = [
        {fname: 'articlePicker', params: finput[0].articlePicker },
        {fname: 'addVoice', params: finput[1].addVoice }
    ] as FuncInterface[]

    const s = functions.stringify()(...finput)   
    assert(s.right)
    console.log(s.right)
    const pf = functions.parse()(s.right)
    assert(pf.right)
    assertEquals(pf.right, finterface)
})
