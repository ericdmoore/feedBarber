import { assert, assertEquals,  } from 'https://deno.land/std@0.152.0/testing/asserts.ts';

import { 
    type FunctionPathBuilderInputDict,
    buildParams,
    parseParams,
    encodeParam, 
    parseParam, 
    legendIsValid, 
    parseLegend,
    parseOptions,
    buildFunctionString
} from '../../src/lib/parsers/enhancementFunctions.ts'

import hipsteripsum  from './helpers/hipsteripsum.ts'
import {encblubrSA, encblubrSBA} from './helpers/encTextBlurb.ts'


Deno.test('basic parse Legend', () => {
    const sba = parseLegend(parseOptions,'sba')
    assert(sba.right)
    assertEquals(sba.right, ['s','b','a'])

    const ma = parseLegend(parseOptions,'ma')
    assert(ma.right)
    assertEquals(ma.right, ['m','a'])

    const bad = parseLegend(parseOptions,'bad')
    assert(!bad.right)
    assert(bad.left)

    const jbgbga = parseLegend(parseOptions,'jbgbga')
    assert(jbgbga.right)
    assert(!jbgbga.left)
    assertEquals('jbgbga'.split(''), jbgbga.right)

    const jaa = parseLegend(parseOptions,'jaa')
    assert(!jaa.right)
    assert(jaa.left)
})

Deno.test('parse and Sort Legend', () => {
    const bas = parseLegend(parseOptions,'bas')
    assert(bas.right)
    assertEquals(bas.right, ['s','b','a'])
})

Deno.test('Pase Long Form Legend', () =>{
    const jba = parseLegend(parseOptions,'JSON,BR,B64')
    assert(jba.right)
    assertEquals(jba.right, ['JSON','BR','B64'])
})

Deno.test('validity requires 1only1 structure and 1only1 encoding legend keys', () => {
    assert(legendIsValid(['s','a']))
    assert(legendIsValid(['s','b','g','a'])) // albeit not practical
    assert(!legendIsValid(['b','a']))
    assert(!legendIsValid(['s','b']))
    assert(!legendIsValid(['s','j','b']))
})

Deno.test('SA encodeParams', () => {
    const legend = 'sa'    
    assertEquals( encodeParam('sa')(null).right, 'null')
    assertEquals( encodeParam('sa')(true).right, 'true')
    assertEquals( encodeParam('sa')(false).right, 'false')
    assertEquals( encodeParam('sa')(42).right, '42')
    assertEquals( encodeParam('sa')(3005).right, '3005')
    assertEquals( encodeParam('sa')(18.82).right, '18.82')
    assertEquals( encodeParam('sa')("Hello World").right, 'sa::SGVsbG8gV29ybGQ=')
    assertEquals( encodeParam('sa')(hipsteripsum).right, encblubrSA)
})

Deno.test('SA decodeParams', () => {
    assertEquals( parseParam()('null').right, null)
    assertEquals( parseParam()('true').right, true)
    assertEquals( parseParam()('false').right, false)
    assertEquals( parseParam()('42').right, 42)
    assertEquals( parseParam()('3005').right, 3005)
    assertEquals( parseParam()('ja::3005').right, 3005)
    assertEquals( parseParam()('sa::3005').right, 3005)
    assertEquals( parseParam()('18.82').right, 18.82)
    assertEquals( parseParam()('::18.82').right, 18.82)
    assertEquals( parseParam()('sa::SGVsbG8gV29ybGQ=').right, 'Hello World')
    assertEquals( parseParam()( encblubrSA).right, hipsteripsum )
})

Deno.test('SBA encode decode', ()=>{
    const encSBA = encodeParam('sba')(hipsteripsum)
    if(encSBA.left){
        console.error(encSBA.left)
        assert(!encSBA.left)
    }else{
        assert(encSBA.right.length < encblubrSA.length, 'Compressed SHOULD BE smaller than unencrypted')
        assertEquals(encSBA.right, encblubrSBA)
        assertEquals(parseParam()(encSBA.right).right, hipsteripsum)
    }
})



Deno.test('encode + parse Param', ()=>{
    const params = {param1:true, param2:{a:1, b:null, c:'Hello World'}}
    const multiParamStr = 'param1=true&param2=ja::eyJhIjoxLCJiIjpudWxsLCJjIjoiSGVsbG8gV29ybGQifQ=='
    const encParamStr = encodeParam('ja')(params)
    if(encParamStr.left){
        assert(!encParamStr.left)
    }else{
        const parsedParam = parseParam()(encParamStr.right).right
        assertEquals(parsedParam, params)
    }
})


Deno.test('parseParams', ()=>{
    const params = {param1:true, param2:{a:1, b:null, c:'Hello World'}}
    const r = parseParams(parseOptions)('param1=true&param2=ja::eyJhIjoxLCJiIjpudWxsLCJjIjoiSGVsbG8gV29ybGQifQ==')
    assertEquals( r.right, params )
    assert( !r.left )
})

Deno.test('Params build + parse ', ()=>{
    const params = {param1:true, param2:{a:1, b:null, c:'Hello World'}}
    const built = buildParams()(params)
    if(built.left){
        assert(!built.left)
    }else{
        const pp = parseParams(parseOptions)(built.right)
        if(pp.left){
            assert(!pp.left)
        }else{
            assertEquals( pp.right, params )
        }
    }
})


Deno.test('buildParams.1', ()=>{
    const params = {param1:true, param2:{a:1, b:null, c:'Hello World'}}
    assertEquals( 
        buildParams()(params).right, 
        'param1=true&param2=ja::eyJhIjoxLCJiIjpudWxsLCJjIjoiSGVsbG8gV29ybGQifQ=='
    )
})

Deno.test('buildParams.2', ()=>{
    const exampleParams = {example: {param1:true, param2:{a:1, b:null, c:'Hello World'}}}
    const r = buildParams()(exampleParams)
    if(r.left){
        assert(!r.left)
    }else{
        assert(r.right)
        assertEquals(r.right, 'example=ja::eyJwYXJhbTEiOnRydWUsInBhcmFtMiI6eyJhIjoxLCJiIjpudWxsLCJjIjoiSGVsbG8gV29ybGQifX0=')
    }
})

Deno.test('buildFunctionString.1', ()=>{
    const exampleFunction = {exampleFn: {param1:true, param2:{a:1, b:null, c:'Hello World'}}}
    const r = buildFunctionString()(exampleFunction)
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
    
    const r = buildFunctionString()(...exampleFunctions)
    // console.log(r)

    if(r.left){
        assert(!r.left)
    }else{
        assert(r.right)
        assertEquals(r.right, 'exampleFn1(p1=true&p2=ja::eyJhIjoxLCJiIjpudWxsLCJjIjoic3RyaW5nIn0=)+exampleFn2(p1=true&p2=false&p3=null&p4=sa::SGVsbG8gV29ybGQ=)')
    }
})


// buildFunctionString
