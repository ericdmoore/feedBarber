import {createClient} from 'https://denopkg.com/ericdmoore/dynamodb-deno@v1.1.0/mod.ts';
import { S3, S3Bucket } from "https://deno.land/x/s3@0.5.0/mod.ts";
import { pollyClient } from '../src/lib/client/aws-polly.ts'


const dynC = createClient({credentials:{accessKeyId:"", secretAccessKey:''}})
const pc = pollyClient('key','sec')

const voicesReq = await pc.DescribeVoices().request()
const bucket = new S3Bucket({accessKeyID:'', secretKey:'', bucket:'',region:''})

console.log({voicesReq , bucket})
// const r2 = await 

