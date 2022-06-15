import { awsV4Sig } from './aws-url-signer.ts'
import { stringify as qsStringify } from 'https://deno.land/x/querystring@v1.0.2/mod.js';

// #region types
export type Engine = 'neural' | 'standard';
export type OutputFormat = 'json' | 'mp3' | 'ogg_vorbis' | 'pcm';
export type SpeechMarkTypes = ('sentence' | 'ssml' | 'viseme' | 'word')[];
export type Gender = 'Female' | 'Male';
export type Status = 'scheduled' | 'inProgress' | 'completed' | 'failed';
export type TextType = 'ssml' | 'text';
export type SampleRate = string;

export type LexiconNames = string[];
export type Text = string;
/*
 Phonetic alphabet used in the lexicon. Valid values are ipa and x-sampa
*/
export type Alphabet = string;
export type Content = string;
export type Name = string;
export type LastModified = number;
export type LexemesCount = number;
export type LexiconArn = string;
export type Size = number;
export type AdditionalLanguageCodes = string[];

export type Id = VoiceId;

/**
 *  Human readable name of the language in English.
 */
export type LanguageName = string;

/**
 * Specifies which engines (standard or neural) that are supported by a given voice.
 */
export type SupportedEngines = Engine[];


export interface GetLexiconResponse {
	Lexicon: {
		Content: string;
		Name: string;
	};
	LexiconAttributes: {
		Alphabet: string;
		LanguageCode: string;
		LastModified: number;
		LexemesCount: number;
		LexiconArn: string;
		Size: number;
	};
}

export interface DescribeVoicesResponse {
	Voices: [
		{
			Id: Id;
			Name: Name;
			Gender: Gender;
			SupportedEngines: SupportedEngines;
			LanguageName: string;
			LanguageCode: LanguageCode;
			AdditionalLanguageCodes: LanguageCode[];
		},
	];
	NextToken: string;
}

export interface SynthesisRequest {
	Engine?: Engine;
	LanguageCode?: LanguageCode;
	LexiconNames?: Name[];
	OutputFormat: OutputFormat;
	SampleRate?: SampleRate;
	SpeechMarkTypes?: SpeechMarkTypes;
	Text: string;
	TextType?: TextType;
	VoiceId?: VoiceId;
}

export type SynthesisTaskRequest = SynthesisRequest & {
    OutputS3BucketName: string
    OutputS3KeyPrefix: string
    SnsTopicArn?: string;
}
	
export interface SynthesisTaskResponse {
	CreationTime: number;
	Engine: Engine;
	LanguageCode: LanguageCode;
	LexiconNames: Name[];
	OutputFormat: OutputFormat;
	OutputUri: string;
	RequestCharacters: number;
	SampleRate: SampleRate;
	SnsTopicArn: string;
	SpeechMarkTypes: SpeechMarkTypes;
	TaskId: string;
	TaskStatus: Status;
	TaskStatusReason: string;
	TextType: TextType;
	VoiceId: VoiceId;
}


export interface SpeechSynthesisTaskResponse {
	SynthesisTask: SynthesisTaskResponse;
}

export interface ListLexiconsResponse {
	Lexicons: [
		{
			Name: Name;
			Attributes: {
				Alphabet: Alphabet;
				LanguageCode: LanguageCode;
				LastModified: number;
				LexemesCount: number;
				LexiconArn: string;
				Size: Size;
			};
		},
	];
	NextToken: string;
}

export interface ListSpeechSynthesisTasks {
	SynthesisTasks: SynthesisTaskResponse[];
	NextToken: string;
}

export type LanguageCode = 
	| 'arb'
	| 'cmn-CN'
	| 'cy-GB'
	| 'da-DK'
	| 'de-DE'
	| 'en-AU'
	| 'en-GB'
	| 'en-GB-WLS'
	| 'en-IN'
	| 'en-US'
	| 'es-ES'
	| 'es-MX'
	| 'es-US'
	| 'fr-CA'
	| 'fr-FR'
	| 'is-IS'
	| 'it-IT'
	| 'ja-JP'
	| 'hi-IN'
	| 'ko-KR'
	| 'nb-NO'
	| 'nl-NL'
	| 'pl-PL'
	| 'pt-BR'
	| 'pt-PT'
	| 'ro-RO'
	| 'ru-RU'
	| 'sv-SE'
	| 'tr-TR'
	| 'en-NZ'
	| 'en-Z';

export type VoiceId =
	| 'Aditi'
	| 'Amy'
	| 'Aria'
	| 'Astrid'
	| 'Ayanda'
	| 'Bianca'
	| 'Brian'
	| 'Camila'
	| 'Carla'
	| 'Carmen'
	| 'Celine'
	| 'Chantal'
	| 'Conchita'
	| 'Cristiano'
	| 'Dora'
	| 'Emma'
	| 'Enrique'
	| 'Ewa'
	| 'Filiz'
	| 'Gabrielle'
	| 'Geraint'
	| 'Giorgio'
	| 'Gwyneth'
	| 'Hans'
	| 'Ines'
	| 'Ivy'
	| 'Jacek'
	| 'Jan'
	| 'Joanna'
	| 'Joey'
	| 'Justin'
	| 'Karl'
	| 'Kendra'
	| 'Kevin'
	| 'Kimberly'
	| 'Lea'
	| 'Liv'
	| 'Lotte'
	| 'Lucia'
	| 'Lupe'
	| 'Mads'
	| 'Maja'
	| 'Marlene'
	| 'Mathieu'
	| 'Matthew'
	| 'Maxim'
	| 'Mia'
	| 'Miguel'
	| 'Mizuki'
	| 'Naja'
	| 'Nicole'
	| 'Olivia'
	| 'Penelope'
	| 'Raveena'
	| 'Ricardo'
	| 'Ruben'
	| 'Russell'
	| 'Salli'
	| 'Seoyeon'
	| 'Takumi'
	| 'Tatyana'
	| 'Vicki'
	| 'Vitoria'
	| 'Zeina'
	| 'Zhiyu';

export interface ResponseOptions<T = unknown>{
	response: ()=>Promise<Response>,
	request: ()=>Promise<Request>,
	json: ()=>Promise<T>,
	text: ()=>Promise<string>,
}

export interface StartSpeechTaskRequired{
	Text: string, 
	OutputS3BucketName: string, 
	OutputS3KeyPrefix: string
}

export interface ListSpeechTasks{
	MaxResults: number; 
	NextToken: string; 
	Status: Status 
}

export interface VoiceFilters {
	Engine?: Engine;
	IncludeAdditionalLanguageCodes?: 'yes' | 'no';
	LanguageCode?: LanguageCode;
	NextToken?: string;
}

export interface PollyClientInterface {
	DeleteLexicon: (LexiconName: string) => ResponseOptions,
	DescribeVoices: (filters?: VoiceFilters) => ResponseOptions<DescribeVoicesResponse>,
	GetLexicon: (LexiconName: string) => ResponseOptions<GetLexiconResponse>,
	GetSpeechSynthesisTask: (taskID: string) => ResponseOptions,
	ListLexicons: (NextToken?: string) => ResponseOptions,
	ListSpeechSynthesisTasks: (opts?: Partial<ListSpeechTasks>) => ResponseOptions<ListSpeechSynthesisTasks>,
	PutLexicon: (LexiconName: string, Content: string) => ResponseOptions,
	StartSpeechSynthesisTask: (reqd: StartSpeechTaskRequired, opts?: Partial<SynthesisTaskRequest>) => ResponseOptions<SpeechSynthesisTaskResponse>,
	SynthesizeSpeech: (opts:SynthesisRequest) => ResponseOptions
}


// #endregion types

const encoder = new TextEncoder();

const sigMaker = (accessKeyId: string, secretAccessKey: string, region: string, service: string) => {
	const sign = awsV4Sig({ 
		region, 
		service,
		awsAccessKeyId: accessKeyId,
		awsSecretKey: secretAccessKey 
	});
	return async (req: Request) => sign(req);
}

const finishUpReq = async (r: Request | Promise<Request>) => {
    // @todo
    // 1.add content-length for POST
    return r
}

const final = <T>(r: Request | Promise<Request>) => {
    return {
		response: async () => {
			const resp = await fetch(await finishUpReq(r))
			await resp.body?.cancel()
			return resp
		},
		request: async () => await finishUpReq(r),
		json: async () =>  (await fetch(await finishUpReq(r))).json() as  Promise<T>,
		text: async () => (await fetch(await finishUpReq(r))).text(),
	};
};


export const pollyClient = (
	awsKey: string,
	awsSecret: string,
    region = 'us-west-2',
	// iamUSer?: string,
	useFips = false,
): PollyClientInterface=> {
	const service = useFips ? 'polly-fips' : 'polly';
	const domain = 'amazonaws.com';
	const basePath = '/v1';
	const base = `https://${service}.${region}.${domain}${basePath}`;
	const addSig = sigMaker(awsKey, awsSecret, region, service);
	return {
		DeleteLexicon: (LexiconName: string) => {
			const req = new Request(`${base}/lexicons/${LexiconName}`, {
				method: 'DELETE',
				headers: { }
			});
			return final(addSig(req));
		},
		DescribeVoices: (
			filters: {
				Engine?: Engine;
				IncludeAdditionalLanguageCodes?: 'yes' | 'no';
				LanguageCode?: LanguageCode;
				NextToken?: string;
			} = { Engine: 'neural', LanguageCode: 'en-US' },
		) => {
            const qs = Object.keys(filters).length> 0 ? `?${qsStringify(filters)}` : ''
			const req = new Request(`${base}/voices${qs}`, {
				method: 'GET',
			});
			return final<DescribeVoicesResponse>(addSig(req));
		},
		GetLexicon: (LexiconName: string) => {
			const req = new Request(`${base}/lexicons/${LexiconName}`, {
				method: 'GET',
				headers: { },
			});
			return final<GetLexiconResponse>(addSig(req));
		},
		GetSpeechSynthesisTask: (taskID: string) => {
			const req = new Request(`${base}'/synthesisTasks'/${taskID}`, {
				method: 'GET',
				headers: { },
			});
			return final(addSig(req));
		},
		ListLexicons: (NextToken?: string) => {
            const qs = NextToken ? `?${qsStringify({NextToken})}` : ''
			const req = new Request(`${base}/lexicons${qs}`, {
				method: 'GET',
				headers: { }
			});
			return final<ListLexiconsResponse>(addSig(req));
		},
		ListSpeechSynthesisTasks: (opts: { MaxResults?: number; NextToken?: string; Status?: Status } = { MaxResults: 100 }) => {
			const qs = Object.keys(opts).length >0 ? `?${qsStringify(opts)}` : ''
            const req = new Request(`${base}/synthesisTasks${qs}`, {
				method: 'GET',
				headers: {}
			});
			return final<ListSpeechSynthesisTasks>(addSig(req));
		},
		PutLexicon: (LexiconName: string, Content: string) => {
			const req = new Request(`${base}/lexicons/${LexiconName}`, {
				method: 'PUT',
                body: encoder.encode(JSON.stringify({ Content })),
				headers: { },
			});
			return final(addSig(req));
		},
		StartSpeechSynthesisTask: (reqd:StartSpeechTaskRequired, opts: Partial<SynthesisTaskRequest> = { VoiceId: 'Matthew', Engine: 'neural' , LanguageCode:'en-US'}) => {
			const req = new Request(`${base}/synthesisTasks`, {
				method: 'POST',
                body : encoder.encode(JSON.stringify({...opts, ...reqd})),
				headers: { 'content-type': 'application/json' },
			});
			return final<SpeechSynthesisTaskResponse>(addSig(req));
		},
		SynthesizeSpeech: (opts:SynthesisRequest) => {
			const req = new Request(`${base}/lexicons`, {
				method: 'POST',
                body : encoder.encode(JSON.stringify(opts)),
				headers: { 'content-type': 'application/json' },
			});
			return final<Uint8Array>(addSig(req));
		},
	};
};

// (async () => {
// 	const env = (await import('../../../tests/.env.json',  {assert: { type: 'json' }})).default
//     // console.log( ' key:', env['AWS_KEY'],'\n', 'secret:', env['AWS_SECRET'],'\n');
    
//     const pc = pollyClient(env['AWS_KEY'], env['AWS_SECRET'])
//     const r = await pc.StartSpeechSynthesisTask({Text:'Text', OutputS3BucketName:'bucket', OutputS3KeyPrefix:'prefix'}).request()
//     // console.log(r)
//     // console.log({r})
// })();
