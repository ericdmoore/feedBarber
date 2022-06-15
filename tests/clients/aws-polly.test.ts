import { skip } from '../helpers.ts'
import { pollyClient } from '../../src/lib/client/aws-polly.ts'
import { assertEquals, assertNotEquals } from 'https://deno.land/std@0.123.0/testing/asserts.ts';

// priority actions
Deno.test('DescribeVoices', async ()=>{
    const aws_env = await (await import('../.env.json', {assert:{type:'json'}})).default
    const pc = pollyClient(aws_env.AWS_KEY, aws_env.AWS_SECRET)
    const request = await pc.DescribeVoices().request()
    assertEquals(request.body, null)
    assertEquals(request.headers.has('Authorization'), true)
    
    
    const authHdr = request.headers.get('Authorization')
    assertEquals(authHdr?.includes('AWS4-HMAC-SHA256 '), true)
    assertEquals(authHdr?.includes('Credential='), true)
    assertEquals(authHdr?.includes('SignedHeaders='), true)
    assertEquals(authHdr?.includes('Signature='), true)

    const response = await pc.DescribeVoices().response()   
    assertEquals(response.status, 200)
    await response.body?.cancel

    const respObj = await pc.DescribeVoices().json()    
    assertEquals(respObj.Voices && true, true)
    // console.log('neural Vocies', respObj.Voices.filter(v=>v.SupportedEngines.includes('neural')))
})

Deno.test('StartSpeechSynthesisTask Create Request', async ()=>{
    const aws_env = await (await import('../.env.json', {assert:{type:'json'}})).default
    const pc = pollyClient(aws_env.AWS_KEY, aws_env.AWS_SECRET)
    const req = {
        OutputS3BucketName: aws_env.pollybucket,
        OutputS3KeyPrefix: 'helloWorld',
        Text: 'Hello World! I some text that you can both read and hear.',
    }

    const request = await pc.StartSpeechSynthesisTask(req).request()
    assertEquals(request.headers.has('Authorization'), true)
    assertEquals(request.body && true,true )
    
    const authHdr = request.headers.get('Authorization')
    assertEquals(authHdr?.includes('AWS4-HMAC-SHA256 '), true)
    assertEquals(authHdr?.includes('Credential='), true)
    assertEquals(authHdr?.includes('SignedHeaders='), true)
    assertEquals(authHdr?.includes('Signature='), true)
})

Deno.test(skip('StartSpeechSynthesisTask Issue Request', async ()=>{
    const aws_env = await (await import('../.env.json', {assert:{type:'json'}})).default
    const pc = pollyClient(aws_env.AWS_KEY, aws_env.AWS_SECRET)
    const req = {
        OutputS3BucketName: aws_env.pollybucket,
        OutputS3KeyPrefix: 'helloWorld',
        Text: 'Hello World! I some text that you can both read and hear.',
    }
    const decoder =  new TextDecoder()
    const resp = await pc.StartSpeechSynthesisTask(req).response()
    // console.log(resp.body)
    console.log(await resp.text())
    console.log(resp)
    
    // const response = await pc.StartSpeechSynthesisTask(req).response()   
    // console.log(response)

    // assertEquals(respObj?.SynthesisTask && true, true)
    // assertEquals(response.status, 200)
}))

Deno.test('ListSpeechSynthesisTasks', async ()=>{
    const aws_env = await (await import('../.env.json', {assert:{type:'json'}})).default
    const pc = pollyClient(aws_env.AWS_KEY, aws_env.AWS_SECRET)

    // const request = await pc.ListSpeechSynthesisTasks().request()
    // assertEquals(request.headers.has('Authorization'), true)
    
    // const authHdr = request.headers.get('Authorization')
    // assertEquals(authHdr?.includes('AWS4-HMAC-SHA256 '), true)
    // assertEquals(authHdr?.includes('Credential='), true)
    // assertEquals(authHdr?.includes('SignedHeaders='), true)
    // assertEquals(authHdr?.includes('Signature='), true)
    
    const r = await pc.ListSpeechSynthesisTasks().response()
    console.log('r: ' ,r)
    assertEquals(r.status, 200)

    const rjson = await pc.ListSpeechSynthesisTasks().json()
    console.log('rjson: \n' ,rjson)
})

Deno.test(skip('SynthesizeSpeech', async ()=>{

}))

// next priority actions
Deno.test(skip('DeleteLexicon', async ()=>{}))
Deno.test(skip('GetLexicon', async ()=>{}))
Deno.test(skip('GetSpeechSynthesisTask', async ()=>{}))
Deno.test(skip('ListLexicons', async ()=>{}))
Deno.test(skip('PutLexicon', async ()=>{}))
