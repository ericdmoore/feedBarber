import type { ISupportedTypes } from './lib/pickType.ts';
import type { AST } from './lib/parsers/ast.ts';

export type PaginationResp<T> = Promise<
	{ val: T; canPrev: boolean; canNext: boolean }
>;

export interface IValidate<T> {
	_: T;
	inputKind: 'rss' | 'atom' | 'sitemap' | 'jsonFeed' | 'scrape';
	clone: (i: unknown) => IValidate<T>;
	paginateFrom: (pos?: number, offset?: number) => PaginationResp<T>;
	validate: () => Promise<T>;
	prev: () => PaginationResp<T>;
	next: () => PaginationResp<T>;
	toXML: () => string;
	toAST: () => Promise<AST>;
}

export interface ASTShell {
	ast: AST;
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

export type MapperFn = (input: ASTShell) => Promise<ASTShell>;
