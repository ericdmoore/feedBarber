import { skip } from '../helpers.ts';
import { assertEquals, assertNotEquals, assertRejects, assert} from 'https://deno.land/std@0.144.0/testing/asserts.ts';
import { S3Bucket } from 'https://denopkg.com/ericdmoore/s3_deno@main/mod.ts';
import { readableStreamFromReader } from 'https://deno.land/std@0.144.0/streams/conversion.ts';
import { StringReader } from 'https://deno.land/std@0.144.0/io/mod.ts';

import { readToString, streamToString } from '../../src/lib/utils/pumpReader.ts';
import {
	splitSynthTaskResponse,
	cacheOurBreadcrumbs,
	haveEverStarted,
	isMediaFinished,
	makeKey,
	splitBucketItemURL,
	textToVoice,
} from '../../src/lib/enhancements/addVoice2text.ts';

import {
	type ASTcomputable,
	type ASTjson,
	ASTFeedItemJson,
	ASTKindComputable,
	computableToJson,
	rezVal,
} from '../../src/lib/parsers/ast.ts';
import { urlToAST } from '../../src/lib/start.ts';
import { s3Mock } from '../mocks/s3/s3Mock.ts';
import { jsonFeed, jsonFeedUrl } from '../mocks/jsonFeed/daringFireball.elon.ts';
import cfg from '../.env.ts';

type AST = ASTjson | ASTcomputable;
type ASTItem = typeof ASTFeedItemJson.TYPE;
type ASTItemAssertion = (item: ASTItem) => Promise<void>;
type ASTAllAssertion = (item: AST) => Promise<void>;

console.warn('WARNING: This Test Runs Against Production Resources');

const encoder = new TextEncoder();
const s3stateGlobal = new Map<string, Uint8Array>();

const config = {
	aws: { key: cfg.AWS_KEY, 
		secret: cfg.AWS_SECRET, 
		region: cfg.REGION },
	config: {
		dynamo: undefined, // {table: cfg.dynamoTable}
		s3: { bucket: cfg.pollybucket, 
			  prefix: cfg.pollyPrefix 
		},
		
	}
}

const runAssertions = (...ASTassertionFns: ASTAllAssertion[]) =>
	(...itemAssertionFns: ASTItemAssertion[]) =>
		async (ast: AST) => {
			// console.log('ast: ', ast)
			const _ast = await computableToJson(ast);
			ASTassertionFns.forEach(async fASTAssert => await fASTAssert(ast))
			
			_ast.items.forEach((item, i) => {
				console.log({ i, 'Len(attachedList)': item.attachments.length, item })
				
				itemAssertionFns.forEach(async (fItemAssert) => {
					await fItemAssert(item)
					// .catch((er) => console.error(er))
				})
			})
};

const testItemsHavettachments = async (item: ASTItem) => {
	const attachmentList = await rezVal(item.attachments);
	if(attachmentList.length === 0) console.log('>>> missing attachment: ', item)
	assertEquals(attachmentList.length > 0, true, 'All items should have attachment');
};

const testItemsHaveValidAttachments = async (item: ASTItem) => {
	// console.log({item})
	const attachentList = await rezVal(item.attachments);
	for (const attached of attachentList) {
		assertEquals('url' in attached && attached.url && true, true, 'All attachments should have a url');
		assertEquals('title' in attached && attached.title && true, true, 'All attachments should have title');
		assertEquals('mimeType' in attached && attached.mimeType && true, true, 'All attachments should have a mimeType');
		assert(attached.sizeInBytes, 'All attachments should have sizeInBytes');
		assert(attached.durationInSeconds, 'All items should have attachment')
	}
};

Deno.test('S3 URL parse', ()=>{
	const r1 = splitBucketItemURL(
		'My.FavBucket',
		"https://s3.us-west-2.amazonaws.com/My.FavBucket/__deleteMe.57db37b7-9bd4-491d-9733-99.mp3"
	)
	assertEquals(r1.bucket, 'My.FavBucket')
	assertEquals(r1.region, 'us-west-2')
	assertEquals(r1.key, '__deleteMe.57db37b7-9bd4-491d-9733-99.mp3')
	assertEquals(r1.ext, '.mp3')

	const r2 = splitBucketItemURL(
		'MyFavBucket',
		"https://MyFavBucket.s3.us-west-2.amazonaws.com/__deleteMe.57db37b7-9bd4-491d-9733-99.mp3"
	)
	assertEquals(r2.bucket, 'MyFavBucket')
	assertEquals(r2.region, 'us-west-2')
	assertEquals(r2.key, '__deleteMe.57db37b7-9bd4-491d-9733-99.mp3')
	assertEquals(r2.ext, '.mp3')
})

Deno.test('streamToString', async () => {
	const data = { a: 1, b: 2, c: 'c', d: { e: 5, f: null } };
	const dataStr = JSON.stringify(data);
	const strR = new StringReader(dataStr);
	const rs0 = readableStreamFromReader(strR);

	const s0 = await streamToString(rs0);
	const o0 = JSON.parse(s0);
	assertEquals(o0, data);
});

Deno.test('readToString', async () => {
	const input = 'Hello';
	const rsInput = readableStreamFromReader(new StringReader(input));
	const collected = await readToString(rsInput);
	assertEquals(input, collected);
});

Deno.test({
	name: 'Valid Attachment For Each Entry ',
	// only: true,
	fn: async () => {
		const ast = await computableToJson(urlToAST({ url: jsonFeedUrl, txt: jsonFeed }))
		const addTextFn = textToVoice(config);

		const astWithAttachments = await addTextFn(ast);
		runAssertions() /* All AST assertions */(testItemsHavettachments, testItemsHaveValidAttachments)(astWithAttachments);
	}
});

Deno.test(skip('Homomorphic Enhancement', async () => {
	const ast = urlToAST({ url: jsonFeedUrl, txt: jsonFeed });
	const addTextFn = textToVoice(config)
	const astWithAttachment = await computableToJson(addTextFn(ast));
	const [err, data] = ASTKindComputable.validate(astWithAttachment);
	assertEquals(err, undefined);
	assertEquals(data && true, true);
}));

Deno.test('Enhancement Validates S3 Params', async () => {
	const ast = urlToAST({ url: jsonFeedUrl, txt: jsonFeed });
	const addTextFn = textToVoice({
		aws: { key: 'sillyExample', region: 'us-west-2', secret: 'somethingNotTooEmbarrasing' },
		config: { s3: { bucket: 5, prefix: '' } },
	}as any);
	assertRejects(()=>addTextFn(ast))
});

Deno.test('Validates S3 Params', async () => {
	const ast = urlToAST({ url: jsonFeedUrl, txt: jsonFeed });
	const addTextFn = textToVoice({
		aws: { 
			key: 'sillyExample', 
			region: 'us-west-2', 
			secret: 'somethingNotTooEmbarrasing' 
		}, 
		config: { 
			s3: { bucket: 42, prefix: '' },
		}
	} as any);
	assertRejects(()=>addTextFn(ast))
});

Deno.test('Validates Dynamo Params', async () => {
	const ast = urlToAST({ url: jsonFeedUrl, txt: jsonFeed });
	const addTextFn = textToVoice({
		aws: { 
			key: 'sillyExample',
			region: 'us-west-2',
			secret: 'somethingNotTooEmbarrasing'
		}, 
		config: {
			s3: { bucket: '42', prefix: 'prefix' },
			dynamo: { table: undefined }
		}
	} as any);

	assertRejects(()=>addTextFn(ast))
});

Deno.test('makeKey changes for config + corpus', async () => {
	const ka1 = await makeKey({ a: 1 }, 'itemText');
	const ka2 = await makeKey({ a: 2 }, 'itemText');
	const kb1 = await makeKey({ a: 1 }, 'item Text');

	assertNotEquals(ka1, ka2);
	assertNotEquals(ka1, kb1);
	assertNotEquals(kb1, ka2);
});

Deno.test('S3 Mock Unit Test', async () => {
	const s3m = s3Mock();
	const encoder = new TextEncoder();
	const decoder = new TextDecoder();
	const data = { a: 1, b: 2, c: { d: 4, e: 5 } };
	const dataEcho = await s3m.putObject('someKey', data);

	const rSFromS3Mock = await (await s3m.getObject('someKey')).body;
	// console.log('>> fromS3Mock :: ',rSFromS3Mock)

	const s3DataStr = await streamToString(rSFromS3Mock);
	// console.log('>> await readToString(fromS3Mock) :: ', s3DataStr)

	const s3DataObj = JSON.parse(s3DataStr);
	// console.log('>> parsed data object :: ', s3DataObj)

	assertEquals(s3DataObj, data);
});

Deno.test('haveEverStarted is based on breadcrumbs', async () => {
	const s3m = s3Mock() as unknown as S3Bucket;
	const key = 'abcd';
	const url = `https://example.com/${key}`;
	const item = {
		title: 'example',
		url,
		id: url,
		authors: [{ name: 'Eric', imageUri: 'http://example.com' }],
		content: { text: 'Some Text' },
		images: { bannerImage: '', indexImage: '' },
		links: { category: '', nextPost: '', prevPost: '', externalURLs: [], tags: [], relLinks: {} },
		attachments: [],
		dates: { modified: Date.now(), published: Date.now() },
	};
	const savedData = await cacheOurBreadcrumbs(
		item,
		key,
		{
				OutputFormat: 'mp3',			
				Engine: 'neural',
				LanguageCode: 'en-US',
				LexiconNames: ['english'],
				SampleRate: '24000',
				VoiceId: 'Matthew',
				
				SpeechMarkTypes: ['sentence'],
				TextType:'text'
		},
		{
			CreationTime: (new Date().getTime()),
			TaskStatus: 'inProgress',
			SnsTopicArn: '',
			TaskId: 'some-uuid-that-has-hypens-and-numbers',
			OutputUri: 'mock://data',
			TaskStatusReason: '',
			RequestCharacters: 42,
		},
		s3m,
	);
	const hasStarted = await haveEverStarted(key, s3m);
	// console.log({hasStarted})
	assertEquals(hasStarted && true, true);
});

Deno.test('isMediaFinished is based on bread crumbs', async () => {
	const s3m = s3Mock() as unknown as S3Bucket;

	const itemNum = 1234;
	const url = `https://example.com/${itemNum}`;
	const item = {
		title: 'example',
		url,
		id: url,
		authors: [{ name: 'Eric', imageUri: 'http://example.com' }],
		content: {
			text:
				'Some Text that will end up in an S3 bucket... but their will also be a meta data object that exists in another s3 location',
		},
		images: { bannerImage: '', indexImage: '' },
		links: { category: '', nextPost: '', prevPost: '', externalURLs: [], tags: [], relLinks:{} },
		attachments: [],
		dates: { modified: Date.now(), published: Date.now() },
	};
	const status: 'completed' | 'failed' | 'inProgress' | 'scheduled' = 'inProgress';

	const synthTask = {
		SynthesisTask: {
			TaskStatus: status,
			TaskId: 'a1b2c3d4',
			CreationTime: Date.now(),
			OutputFormat: 'mp3' as 'mp3',
			OutputUri: 'https://audio.example.com/1234',
			Engine: 'neural' as 'neural',
			LanguageCode: 'en-US' as 'en-US',
			LexiconNames: [''],
			RequestCharacters: 42,
			SampleRate: '24000',
			SnsTopicArn: '',
			SpeechMarkTypes: ['sentence'] as ['sentence'],
			TaskStatusReason: '',
			TextType: 'text' as 'text',
			VoiceId: 'Matthew' as 'Matthew',
		},
	};

	const key = await makeKey(item, item.content.text);
	const {taskIDs, ...tcfg} = splitSynthTaskResponse(synthTask.SynthesisTask)
	const breadCrumbs = await cacheOurBreadcrumbs(item, key, tcfg.config, taskIDs, s3m);
	const hasStarted = await haveEverStarted(key, s3m);

	assertEquals('sk' in breadCrumbs, true);
	assertEquals('pk' in breadCrumbs, true);
	assertEquals('item' in breadCrumbs, true);
	assertEquals('task' in breadCrumbs, true);

	if (hasStarted) {
		const isFinished = await isMediaFinished(hasStarted);
		assertEquals(isFinished, false);
	}
	assertEquals(!!hasStarted, true);
});

Deno.test('isMediaFinished is now complete', async () => {
	const s3m = s3Mock() as unknown as S3Bucket;

	const itemNum = 1234;
	const url = `https://example.com/${itemNum}`;
	const item = {
		title: 'example',
		url,
		id: url,
		authors: [{ name: 'Eric', imageUri: 'http://example.com' }],
		content: {
			text:
				'Some Text that will end up in an S3 bucket... but their will also be a meta data object that exists in another s3 location',
		},
		images: { bannerImage: '', indexImage: '' },
		links: { category: '', nextPost: '', prevPost: '', externalURLs: [], tags: [], relLinks:{} },
		attachments: [],
		dates: { modified: Date.now(), published: Date.now() },
	};
	const status: 'completed' | 'failed' | 'inProgress' | 'scheduled' = 'completed';

	const synthTask = {
		SynthesisTask: {
			TaskStatus: status,
			TaskStatusReason: '',
			TaskId: 'a1b2c3d4',
			CreationTime: Date.now(),
			OutputFormat: 'mp3' as 'mp3',
			OutputUri: 'https://audio.example.com/1234',
			Engine: 'neural' as 'neural',
			LanguageCode: 'en-US' as 'en-US',
			LexiconNames: [''],
			RequestCharacters: 42,
			SampleRate: '24000',
			SnsTopicArn: '',
			SpeechMarkTypes: ['sentence'] as ['sentence'],
			TextType: 'text' as 'text',
			VoiceId: 'Matthew' as 'Matthew',
		},
	};

	const key = await makeKey(item, item.content.text);

	const {taskIDs, ...tcfg} = splitSynthTaskResponse(synthTask.SynthesisTask)
	const breadCrumbs = await cacheOurBreadcrumbs(item, key, tcfg.config, taskIDs, s3m);
	const hasStarted = await haveEverStarted(key, s3m);

	assertEquals('sk' in breadCrumbs, true);
	assertEquals('pk' in breadCrumbs, true);
	assertEquals(breadCrumbs.pk, breadCrumbs.sk);
	assertEquals('item' in breadCrumbs, true);
	assertEquals('task' in breadCrumbs, true);
	assertEquals(!!hasStarted, true);

	if (hasStarted) {
		const isFinished = await isMediaFinished(hasStarted);
		assertEquals(isFinished, true);
	}
});

Deno.test(skip('cacheOurBreadcrumbs will saves at least the minimum set', async () => {}));

Deno.test(skip('example', async () => {}));

// WAIT FOR the s3 resources to show ... then delete
