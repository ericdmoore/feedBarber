import type { 
	ASTComputable, 
	ASTJson, 
	PromiseOr 
} from '../../types.ts';
import addHashExp from './addHash.ts';
import loadRawAndArticleExp from './addLoadRaw.ts';
import addPostLinksExp from './addPostLinks.ts';
import polly from './addVoice2text.ts'
import setPathExp from './setPath.ts';

type Dict<T> = { [key: string]: T };
type AST = ASTComputable | ASTJson

export type ASTChainFunc = (i: unknown) => (ast: PromiseOr<AST>) => Promise<AST>;
export type Enhancer = { f: ASTChainFunc; param: string };

export interface EnhancementModule{
	run: ASTChainFunc,
	cloud?: {
		install: (...inputs:unknown[]) => Promise<string>,
		remove: (...inputs:unknown[]) => Promise<string>,
		aws: {
			install: (...inputs:unknown[]) => Promise<string>
			remove: (...inputs:unknown[]) => Promise<string>,
		},
		azure: {
			install: (...inputs:unknown[]) => Promise<string>,
			remove: (...inputs:unknown[]) => Promise<string>,
		},
		gcloud: {
			install: (...inputs:unknown[]) => Promise<string>,
			remove: (...inputs:unknown[]) => Promise<string>,
		},
	}
	params: {
		run: string,
		cloud?: {
			install: string,
			remove: string,
			aws: string,
			gcloud: string,
			azure: string,
		},
	}
}

export const funcMap = {
	// URL string - {f: func, param: JSON Schema String}
	hash: addHashExp,
	h: addHashExp,
	article: loadRawAndArticleExp,
	a: loadRawAndArticleExp,
	postLinks: addPostLinksExp,
	pl: addPostLinksExp,
	set: setPathExp,
	polly: polly
} as Dict<EnhancementModule>;

export default funcMap;
