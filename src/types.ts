import type { ISupportedTypes } from "./lib/pickType.ts";
export type PaginationResp<T> = Promise<
  { val: T; canPrev: boolean; canNext: boolean }
>;

export interface IValidate<T> {
  _: T;
  inputKind: "rss" | "atom" | "sitemap" | "jsonFeed" | "scrape";
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

export interface AST {
  title?: string;
  entries?: string[];
}

/*

RSS 2.0 	        Atom 1.0 	Comments

channel 	        feed
title 	            title
link 	            link 	Atom defines an extensible family of rel values
description 	    subtitle
language 	        Atom uses standard xml:lang attribute
copyright 	        rights
managingEditor 	    author or contributor
pubDate 	        entry.published (in entry) 	Atom has no feed-level equivalent
lastBuildDate (in channel) 	updated 	RSS has no item-level equivalent
category 	        category
generator 	        generator
image 	            logo 	Atom recommends 2:1 aspect ratio
item 	            entry
author 	            author
description 	    summary and/or content 	depending on whether full content is provided
enclosure 	        <link rel="enclosure">
guid 	            id
source 	            <link rel="via">

??? - 	source 	Container for feed-level metadata to support aggregation
*/
