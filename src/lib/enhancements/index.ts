import type { ASTComputable, PromiseOr } from '../../types.ts';
import addHashExp  from './addHash.ts';
import loadRawAndArticleExp from './addLoadRaw.ts'
import addPostLinksExp from './addPostLinks.ts'

type Dict<T> = {[key:string] : T}
export type ASTChainFunc = (i:unknown)=>(ast: PromiseOr<ASTComputable>) => Promise<ASTComputable>
export type Enhancer = {f: ASTChainFunc, param: string}

export const funcMap = {
	// URL string - {f: func, param: JSON Schema String}
	hash: addHashExp,
	article: loadRawAndArticleExp,
	postLinks: addPostLinksExp
} as Dict<Enhancer>

export default funcMap;
