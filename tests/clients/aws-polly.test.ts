import { skip, envData } from '../helpers.ts'
import { pollyClient, type Status } from '../../src/lib/client/aws-polly.ts'
import { assertEquals, assertNotEquals } from 'https://deno.land/std@0.123.0/testing/asserts.ts';

// priority actions
Deno.test('DescribeVoices', async ()=>{
    const envs = await envData()
    const pc = pollyClient(envs.AWS_KEY, envs.AWS_SECRET)
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
    const envs = await envData()
    const pc = pollyClient(envs.AWS_KEY, envs.AWS_SECRET)
    const req = {
        OutputS3BucketName: envs.pollybucket,
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

Deno.test('ListSpeechSynthesisTasks', async ()=>{
    const envs = await envData()
    const pc = pollyClient(envs.AWS_KEY, envs.AWS_SECRET)

    const request = await pc.ListSpeechSynthesisTasks().request()
    assertEquals(request.headers.has('Authorization'), true)
    
    const authHdr = request.headers.get('Authorization')
    assertEquals(authHdr?.includes('AWS4-HMAC-SHA256 '), true)
    assertEquals(authHdr?.includes('Credential='), true)
    assertEquals(authHdr?.includes('SignedHeaders='), true)
    assertEquals(authHdr?.includes('Signature='), true)
    
    const r = await pc.ListSpeechSynthesisTasks().response()
    // console.log('r: ' ,r)
    assertEquals(r.status, 200)

    const rjson = await pc.ListSpeechSynthesisTasks().json()
    // console.log('rjson: \n' ,rjson)
})

Deno.test('StartSpeechSynthesisTask Create Request', async ()=>{
    const envs = await envData()
    const pc = pollyClient(envs.AWS_KEY, envs.AWS_SECRET)
    const req = {
        OutputS3BucketName: envs.pollybucket,
        OutputS3KeyPrefix: 'helloWorld',
        Text: 'Hello World! I some text that you can both read and hear.',
    }
    
    const request = await pc.StartSpeechSynthesisTask(req).request()
    assertEquals(request.headers.has('Authorization'), true)
    
    const authHdr = request.headers.get('Authorization')
    assertEquals(authHdr?.includes('AWS4-HMAC-SHA256 '), true)
    assertEquals(authHdr?.includes('Credential='), true)
    assertEquals(authHdr?.includes('SignedHeaders='), true)
    assertEquals(authHdr?.includes('Signature='), true)
})

Deno.test('StartSpeechSynthesisTask Issue Request', async ()=>{
    const envs = await envData()
    const pc = pollyClient(envs.AWS_KEY, envs.AWS_SECRET)
    const req = {
        OutputS3BucketName: envs.pollybucket,
        OutputS3KeyPrefix: 'helloWorld',
        Text: 'Hello World! I some text that you can both read and hear.',
    }
    
    const r = await pc.StartSpeechSynthesisTask(req).json()
    assertEquals(r.SynthesisTask && true, true)
})

Deno.test('Observe a task in-flight (within the queue)', async (t) =>{
    const envs = await envData()
    const pc = pollyClient(envs.AWS_KEY, envs.AWS_SECRET)
    const b = Object.entries(Deno.build).map(([k,v])=>`${k}=${v}`).join('+')
    const req = {
        OutputS3BucketName: envs.pollybucket,
        OutputS3KeyPrefix: `deleteMe-${Date.now()}-${b}`,
        Text: `This text was generated on ${(new Date).toISOString()} from a system that has ${Object.entries(Deno.build).map(([k,v])=>`${k} equal to ${v}`).join(' and ')}`,
    }

    let TaskID: string
    let status: Status

    await t.step('Issue new Start Task Request', async ()=>{
        const r =  await pc.StartSpeechSynthesisTask(req).json()
        status = r.SynthesisTask.TaskStatus
        TaskID = r.SynthesisTask.TaskId
        console.log({task:r, TaskID, status})
        assertEquals(status.includes('inProgress') || status.includes('scheduled') ,true)
    })

    await t.step('Observe the Task in Queue', async ()=>{
        const r =  await pc.ListSpeechSynthesisTasks({Status: status as Status }).json()
        const list = r.SynthesisTasks.filter(t=>t.TaskId ===  TaskID)
        assertEquals(list.length > 0 ,true)
        console.log(list)
    })
})


Deno.test(skip('SynthesizeSpeech', async ()=>{}))

// next priority actions
Deno.test(skip('DeleteLexicon', async ()=>{}))
Deno.test(skip('GetLexicon', async ()=>{}))
Deno.test(skip('GetSpeechSynthesisTask', async ()=>{}))
Deno.test(skip('ListLexicons', async ()=>{}))
Deno.test(skip('PutLexicon', async ()=>{}))

