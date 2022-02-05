import type { ISupportedTypes } from './lib/start.ts';
import type { AST as _AST, ASTcomputable, ASTjson } from './lib/parsers/ast.ts';
import type { Node as _Node } from './mods/unist.ts';
import { vfile } from './mod.ts';

export type PaginationResp<T> = Promise<
	{ val: T; canPrev: boolean; canNext: boolean }
>;

export interface IValidate<T> {
	_: T;
	inputKind: 'rss' | 'atom' | 'sitemap' | 'jsonfeed' | 'scrape';
	clone: (i: unknown) => IValidate<T>;
	paginateFrom: (pos?: number, offset?: number) => PaginationResp<T>;
	validate: () => Promise<T>;
	prev: () => PaginationResp<T>;
	next: () => PaginationResp<T>;
	toXML: () => string;
	toAST: () => Promise<_AST>;
	exportAs: (type: 'rss' | 'atom' | 'jsonfeed') => Promise<string>;
	fromAST: (ast: ASTjson | ASTComputable, ...other: unknown[]) => Promise<T>;
}

export interface ASTShell {
	ast: _AST;
	pos: {
		pageBy: number;
		total: number;
		cur: number;
		remaining: number;
	};
	parserData: ISupportedTypes;
	next: () => Promise<ASTShell>;
	prev: () => Promise<ASTShell>;
	use: (Fns: MapperFn[]) => Promise<ASTShell>;
	toXML: () => string;
}

export type ReducerFn = (
	prior: ASTShell,
	cur: ASTShell,
	i: number,
	all: ASTShell[],
) => Promise<ASTShell>;

export type UnifiedAttacher = (...options: unknown[]) => UnfiedTransformer;
export type UnfiedTransformer = (
	node: _Node,
	file: vfile.VFile,
	next: UnfiedTransformer,
) => Promise<_Node>;

export type MapperFn = (input: ASTShell) => Promise<ASTShell>;
export type AST = _AST;
export type ASTComputable = ASTcomputable;
export type Node = _Node;
export type VFile = vfile.VFile;
