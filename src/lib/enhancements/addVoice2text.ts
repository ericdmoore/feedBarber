// @todo figure this out in some proper sense
// perhaps usiung STS + assumeRole
// perhaps just figuring
// const iamClient = new IAMClient({region: 'REGION'})
// const iamResp = await iamClient.send(new SimulateCustomPolicyCommand({
//     ActionNames:[ 's3:PutObject',  's3:GetObject',  's3:ListObjectsV2' ],
//     PolicyInputList:[],
// }))

// // or list user policies

// const canProceedWithKeys = iamResp.EvaluationResults?.every(r=>{r.EvalDecision ==='allowed'})

// DECISION: chose to use task command in lieu of speech command
// BECAUSE:
// 1) There is a reasonably simple way to peek at the task queue
// 2) the use case will be performing this by page of items - aka 10 - 25 items in parallel
//  which seems like the type best suited for our use-case

// initial load (UNSEEN) - creates the job task
// subsequent loads - update the status
// use attachment.url -> use A
// A) data url to SVG that says scheduled, inprogress, or the real URL
// mimeType: text/svg
//
// then, mimeType - mp3 and real URL
// OR (B) -> 2 placeholder mp3 scheduled - inprogress
// until it exists, and is pulled from the S3 datastore

// hash(inputConfig + text)
// check s3 for a key
// found - return
// not found - then make it
// and upload to s3 bucket for URL
// name: hash(inputconfig + text)
// add the URL to the attachments
// upload task meta - JSON string hash(hash map)
// incase we do this same set again - all the data is ready to parse

// 3 States:

// check S3
// UNSEEN(not found)
// start task
// write temp file1 + file2
// return attachments with 'scheduled'
// WAITING(found meta data - no final asset)
// read temp file
// check job ID
// checking for final asset
// not-found
// return attachments with 'scheduled' | 'inprogress'
// FINISHED(found final asset)
// found final asset
// incorporate into the

import { PromiseOr } from '../../types.ts';
import { superstruct as s } from '../../mod.ts';
import { readToString, streamToString } from '../utils/pumpReader.ts';

import { 
	type ASTcomputable, 
	type ASTFeedItemJson, 
	type ASTjson, 
	computableToJson, 
	rezVal 
} from '../parsers/ast.ts';
import {
	type OutputFormat,
	pollyClient,
	type PollyClientInterface,
	type SpeechSynthesisTaskResponse,
	type StartSpeechTaskRequired,
	type SynthesisRequest,
	type VoiceId,
} from '../client/aws-polly.ts';

import { S3Bucket } from 'https://deno.land/x/s3@0.5.0/mod.ts';
import { createClient, DynamoDBClient } from 'https://denopkg.com/chiefbiiko/dynamodb@master/mod.ts';
import { hmac } from 'https://deno.land/x/hmac@v2.0.1/mod.ts';

type AST = ASTjson | ASTcomputable;

const encoder = new TextEncoder();

export const text2VoiceParams = s.object({
	aws: s.object({
		key: s.string(),
		secret: s.string(),
		region: s.string(),
		iamUserName: s.optional(s.string()),
	}),
	config: s.object({
		s3: s.object({
			bucket: s.string(),
			prefix: s.optional(s.string()),
		}),
		dynamo: s.optional(s.object({
			table: s.string(),
			pk: s.string(),
			sk: s.string(),
		})),
		polly: s.optional(s.partial(s.object({
			VoiceId: s.string(),
			// from PolyClient Enum: OutputFormat
			OutputFormat: s.enums(['json', 'mp3', 'ogg_vorbis', 'pcm']),
			SampleRate: s.string(),
			useNeuralEngine: s.boolean(),
			isPlainText: s.boolean(),
			onCompletion: s.object({
				snsTopic: s.string(),
			}),
		}))),
	}),
});

const defCfgType = s.object({
	aws: text2VoiceParams.schema.aws,
	s3: s.object({
		...text2VoiceParams.schema.config.schema.s3.schema,
		prefix: s.string(),
	}),
	polly: s.object({
		...text2VoiceParams.schema.config.schema.polly.schema,
		VoiceId: s.string(),
		OutputFormat: s.enums(['json', 'mp3', 'ogg_vorbis', 'pcm']),
		SampleRate: s.string(),
		useNeuralEngine: s.boolean(),
		isPlainText: s.boolean(),
	}),
});

interface pollyConfig {
	VoiceId: VoiceId;
	OutputFormat: OutputFormat;
	SampleRate: string;
	useNeuralEngine: true;
	isPlainText: true;
}

/**
 * Text To Voice
 * @param params
 * @param ast
 */
export const textToVoice = (userParams: s.Infer<typeof text2VoiceParams>, pc?: PollyClientInterface, s3c?: S3Bucket) =>
	async (_ast: PromiseOr<AST>): Promise<ASTjson> => {
		// check key,secret permissions
		// s3: read, write
		// polly send, sendTask

		// text2VoiceParams

		const ast = await computableToJson(_ast);

		const polly = {
			VoiceId: 'Matthew' as VoiceId,
			OutputFormat: 'mp3' as OutputFormat,
			SampleRate: '24000',
			useNeuralEngine: true,
			isPlainText: true,
			...userParams.config.polly,
		} as typeof userParams.config.polly & pollyConfig;

		const defCfg = {
			aws: { ...userParams.aws },
			s3: {
				prefix: '',
				...userParams.config.s3,
			},
			polly,
		};

		const [err] = defCfgType.validate(defCfg);
		if (err) return Promise.reject({ msg: 'Input Validate Error', err, code: 400 });

		const items: typeof ASTFeedItemJson.TYPE[] = ast.items;
		const handleItem = makeItemHandler(
			defCfg,
			pc ?? pollyClient(
				defCfg.aws.key,
				defCfg.aws.secret,
				defCfg.aws.region,
			),
			s3c ?? new S3Bucket({
				bucket: defCfg.s3.bucket,
				region: defCfg.aws.region,
				accessKeyID: defCfg.aws.key,
				secretKey: defCfg.aws.secret,
			}),
			createClient({
				region: defCfg.aws.region,
				credentials: {
					accessKeyId: defCfg.aws.key,
					secretAccessKey: defCfg.aws.secret,
				},
			}),
		);

		// mutate items
		for (let i = 0; i < items.length; i++) {
			items[i] = await handleItem(items[i], i, items);
		}

		return { ...ast, items };
	};

const inProgressPlaceholderURL = (msg: string, x = 0, y = 15): string => `
<svg height="60" width="200">
    <text x="${x}" y="${y}" fill="red" transform="rotate(30 20,40)">${msg}</text>
    ${msg}
</svg>`;

const scheduledPlaceholderURL = (msg: string, x = 0, y = 15): string => `
<svg height="60" width="200">
    <text x="${x}" y="${y}" fill="red" transform="rotate(30 20,40)">${msg}</text>
    ${msg}
</svg>`;

const placeholderURL = (status: 'inprogress' | 'scheduled', x = 0, y = 15): string =>
	status === 'inprogress' ? inProgressPlaceholderURL('in progress', x, y) : scheduledPlaceholderURL('scheduled', x, y);

export const makeKey = async (config: unknown, itemText: string) => {
	const sig = (msg: string, key = 'key') => hmac('sha256', key, msg, undefined, 'hex') as string;
	const configHMAC = sig(JSON.stringify(config));
	const dataHMAC = sig(itemText);
	return `k01--${await sig(configHMAC + dataHMAC)}`;
};

type DoubleNestedDict = { task: { [key: string]: string }; [key: string]: { [key: string]: string } };

export const haveEverStarted = async (
	itemKey: string,
	s3c: S3Bucket,
	dynC?: DynamoDBClient,
): Promise<DoubleNestedDict | null> => {
	if (dynC) {
		const dynoResp = await dynC.get({ pk: itemKey, sk: itemKey }).catch(() => null) as DoubleNestedDict | null;
		return dynoResp;
	} else {
		const s3cache = await s3c.getObject(itemKey + '.json').catch(() => null);
		// if(s3cache){
		// 	const sw = new StringWriter()
		// 	await s3cache.body
		// 		.pipeThrough(new TextDecoderStream())
		// 		// .pipeTo()
		// }else{
		// 	console.log('')
		// }
		
		// // console.log(streamDecoder.)
		return s3cache ? JSON.parse(await streamToString(s3cache.body)) : null as DoubleNestedDict | null;
	}
};

export const isMediaFinished = async (cacheObject: { task: { [key: string]: string } }): Promise<boolean> => {
	if (cacheObject?.task?.TaskStatus.toLowerCase() === 'completed') {
		return true;
	} else {
		return false;
	}
};

export const cacheOurBreadcrumbs = async (
	item: typeof ASTFeedItemJson.TYPE,
	itemKey: string,
	taskOutput: SpeechSynthesisTaskResponse,
	s3c: S3Bucket,
	dynC?: DynamoDBClient,
) => {
	// r.SynthesisTask?.TaskId
	// r.SynthesisTask?.CreationTime
	// r.SynthesisTask?.TaskStatus
	// r.SynthesisTask?.OutputUri
	// cache all this ^ too
	const saved = { sk: itemKey, pk: itemKey, item, task: taskOutput };
	if (dynC) {
		const r = await dynC.PutItem(saved);
		console.info('Dynamo response: ', r);
	}
	await s3c.putObject(itemKey + '.json', encoder.encode(JSON.stringify(saved)));
	return saved;
};

export const makeItemHandler = (
	config: s.Infer<typeof defCfgType>,
	pc: PollyClientInterface,
	s3c: S3Bucket,
	dynC?: DynamoDBClient,
) =>
	async (
		item: typeof ASTFeedItemJson.TYPE,
		_itemNumber: number,
		_list: typeof ASTFeedItemJson.TYPE[],
	): Promise<typeof ASTFeedItemJson.TYPE> => {
		const c = await rezVal(item.content);
		const chosenText = c.text ?? c.markdown ?? c.article ?? c.html ?? c.raw ?? 'no text provided';
		const k = await makeKey(config, chosenText);

		const started = await haveEverStarted(k, s3c, dynC);
		if (started) {
			if (await isMediaFinished(started)) {
				console.log('cool, already done');

				// update attachment
				// pin the attachment
				return item;
			} else {
				console.log('nice to see you again');
				// update attachment
				// pin the attachment
				placeholderURL('inprogress');
				return item;
			}
		} else {
			// send off the text
			// make the attachment
			// pin the attachment
			console.log('nice to meet you');

			const taskCommandReqd: StartSpeechTaskRequired = {
				Text: chosenText,
				OutputS3BucketName: config.s3.bucket,
				OutputS3KeyPrefix: config.s3.prefix,
			};
			const taskCommandOpts: Partial<SynthesisRequest> = {
				OutputFormat: config.polly.OutputFormat,
				VoiceId: config.polly.VoiceId as VoiceId,
				SampleRate: config.polly.SampleRate,
				TextType: config.polly.isPlainText ? 'text' : 'ssml',
				Engine: config.polly.useNeuralEngine ? 'neural' : 'standard',
				...(config.polly.onCompletion?.snsTopic ? { SnsTopicArn: config.polly.onCompletion?.snsTopic } : {}),
			};

			const commandResponse = await pc.StartSpeechSynthesisTask(taskCommandReqd, taskCommandOpts).json();
			const breadcrumbs = await cacheOurBreadcrumbs(item, k, commandResponse, s3c, dynC);
			console.log('cache:', breadcrumbs);
			return item;
		}
	};

export default { f: textToVoice, param: JSON.stringify(text2VoiceParams) };

// const speechTasksForPage =  await Promise.all(
//         list.map(
//             async item => {
//                 const content = await rezVal(item.content)
//                 const taskCommand = new StartSpeechSynthesisTaskCommand({
//                     Text: content.text ?? content.markdown,
//                     OutputFormat: defCfg.polly.OutputFormat,
//                     OutputS3BucketName: defCfg.s3.bucket,
//                     OutputS3KeyPrefix: defCfg.s3.prefix,
//                     VoiceId: defCfg.polly.VoiceId,
//                     SampleRate: defCfg.polly.SampleRate,
//                     TextType: defCfg.polly.isPlainText ? TextType.TEXT : TextType.SSML,
//                     Engine: defCfg.polly.useNeuralEngine ? Engine.NEURAL : Engine.STANDARD,
//                     ...(defCfg.polly.onCompletion?.snsTopic ? {SnsTopicArn: defCfg.polly.onCompletion?.snsTopic} : {}),
//                 })
//                 return pollyClient.send(taskCommand)
//         }
//     )
// )

// const speechTasksForPage =  await Promise.all( list.map( async item => {
//             const content = await rezVal(item.content)
//             const taskCommand = new StartSpeechSynthesisTaskCommand({
//                 Text: content.text ?? content.markdown,
//                 OutputFormat: defCfg.polly.OutputFormat,
//                 OutputS3BucketName: defCfg.s3.bucket,
//                 OutputS3KeyPrefix: defCfg.s3.prefix,
//                 VoiceId: defCfg.polly.VoiceId,
//                 SampleRate: defCfg.polly.SampleRate,
//                 TextType: defCfg.polly.isPlainText ? TextType.TEXT : TextType.SSML,
//                 Engine: defCfg.polly.useNeuralEngine ? Engine.NEURAL : Engine.STANDARD,
//                 ...(defCfg.polly.onCompletion?.snsTopic ? {SnsTopicArn: defCfg.polly.onCompletion?.snsTopic} : {}),
//             })
//             return pollyClient.send(taskCommand)
//         }
//     )
// )
