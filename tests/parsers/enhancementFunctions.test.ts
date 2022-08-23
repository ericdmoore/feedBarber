import { assert, assertEquals,  } from "https://deno.land/std@0.152.0/testing/asserts.ts"

import { 
    buildParams,
    parseParams,
    encodeParam, 
    parseParam, 
    legendIsValid, 
    parseLegend,
    parseOptions
} from '../../src/lib/parsers/enhancementFunctions.ts'

import hipsteripsum  from './helpers/hipsteripsum.ts'
import {encblubrSA, encblubrSBA} from './helpers/encTextBlurb.ts'


Deno.test('basic parse Legend', () => {
    const sba = parseLegend(parseOptions,'sba')
    assert(sba.val)
    assertEquals(sba.val, ['s','b','a'])

    const ma = parseLegend(parseOptions,'ma')
    assert(ma.val)
    assertEquals(ma.val, ['m','a'])

    const bad = parseLegend(parseOptions,'bad')
    assert(!bad.val)
    assert(bad.err)

    const jbgbga = parseLegend(parseOptions,'jbgbga')
    assert(jbgbga.val)
    assert(!jbgbga.err)
    assertEquals('jbgbga'.split(''), jbgbga.val)

    const jaa = parseLegend(parseOptions,'jaa')
    assert(!jaa.val)
    assert(jaa.err)
})

Deno.test('parse and Sort Legend', () => {
    const {val, err} = parseLegend(parseOptions,'bas')
    assert(val)
    assertEquals(val, ['s','b','a'])
})

Deno.test('Pase Long Form Legend', () =>{
    const {val, err} = parseLegend(parseOptions,'JSON,BR,B64')
    assert(val)
    assertEquals(val, ['JSON','BR','B64'])
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
    assertEquals( encodeParam('sa')(null).val, 'null')
    assertEquals( encodeParam('sa')(true).val, 'true')
    assertEquals( encodeParam('sa')(false).val, 'false')
    assertEquals( encodeParam('sa')(42).val, '42')
    assertEquals( encodeParam('sa')(3005).val, '3005')
    assertEquals( encodeParam('sa')(18.82).val, '18.82')
    assertEquals( encodeParam('sa')("Hello World").val, 'sa::SGVsbG8gV29ybGQ=')
    assertEquals( encodeParam('sa')(hipsteripsum).val, encblubrSA)
})

Deno.test('SA decodeParams', () => {
    assertEquals( parseParam()('null').val, null)
    assertEquals( parseParam()('true').val, true)
    assertEquals( parseParam()('false').val, false)
    assertEquals( parseParam()('42').val, 42)
    assertEquals( parseParam()('3005').val, 3005)
    assertEquals( parseParam()('ja::3005').val, 3005)
    assertEquals( parseParam()('sa::3005').val, 3005)
    assertEquals( parseParam()('18.82').val, 18.82)
    assertEquals( parseParam()('::18.82').val, 18.82)
    assertEquals( parseParam()('sa::SGVsbG8gV29ybGQ=').val, 'Hello World')
    assertEquals( parseParam()( encblubrSA).val, hipsteripsum )
})

Deno.test('SBA encode decode', ()=>{
    const encSBA = encodeParam('sba')(hipsteripsum)
    if(encSBA.err){
        console.error(encSBA.err)
        assert(!encSBA.err)
    }else{
        assert(encSBA.val.length < encblubrSA.length, 'Compressed SHOULD BE smaller than unencrypted')
        assertEquals(encSBA.val, encblubrSBA)
        assertEquals(parseParam()(encSBA.val).val, hipsteripsum)
    }
})

Deno.test('parseParams', ()=>{
    const params = {param1:true, param2:{a:1, b:null, c:'Hello World'}}
    const r = parseParams(parseOptions)('param1=true&param2=ja::eyJhIjoxLCJiIjpudWxsLCJjIjoiSGVsbG8gV29ybGQifQ==')
    assertEquals( r.val, params )
    assert( !r.err )
})


Deno.test('encode + parseParams', ()=>{
    const params = {param1:true, param2:{a:1, b:null, c:'Hello World'}}
    const multiParamStr = 'param1=true&param2=ja::eyJhIjoxLCJiIjpudWxsLCJjIjoiSGVsbG8gV29ybGQifQ=='
    const encParamStr = encodeParam('ja')(params)
    if(encParamStr.err){
        assert(!encParamStr.err)
    }else{
        const parsedParam = parseParam()(encParamStr.val).val
        assertEquals(parsedParam, params)
    }
})

Deno.test('buildParams.1', ()=>{
    const params = {param1:true, param2:{a:1, b:null, c:'Hello World'}}
    assertEquals( 
        buildParams(parseOptions)(params).val, 
        'param1=true&param2=ja::eyJhIjoxLCJiIjpudWxsLCJjIjoiSGVsbG8gV29ybGQifQ=='
    )
})

Deno.test('buildParams.2', ()=>{
    const exampleParams = {example: {param1:true, param2:{a:1, b:null, c:'Hello World'}}}
    const r = buildParams(parseOptions)(exampleParams)
    if(r.err){
        assert(!r.err)
    }else{
        assert(r.val)
        assertEquals(r.val, 'example=ja::eyJwYXJhbTEiOnRydWUsInBhcmFtMiI6eyJhIjoxLCJiIjpudWxsLCJjIjoiSGVsbG8gV29ybGQifX0=')
    }
})

Deno.test('buildParams.2', ()=>{
    const exampleParams = {example: {param1:true, param2:{a:1, b:null, c:'Hello World'}}}
    const r = buildParams(parseOptions)(exampleParams)
    if(r.err){
        assert(!r.err)
    }else{
        assert(r.val)
        assertEquals(r.val, 'example=ja::eyJwYXJhbTEiOnRydWUsInBhcmFtMiI6eyJhIjoxLCJiIjpudWxsLCJjIjoiSGVsbG8gV29ybGQifX0=')
    }
})