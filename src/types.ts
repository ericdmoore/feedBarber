import type { FeedData } from "feed-reader";
import { string } from "fp-ts";

interface Person {
  name: string;
  email: string;
  uri: string;
}

export interface InputRSS {
  link: string;
  title: string;
  description: string;

  language?: string;
  copyright?: string;

  image?: {
    url: string;
    title: string;
    link: string;
  };

  lastBuildDate?: Date;
  generator?: string;
  entries?: EntryFromRssFeed[];
}

export interface EntryFromRssFeed {
  link: string;
  title: string;
  subtitle?: string;
  content: string;
  summary?: string;
  author?: Person;
  pubDate: Date;
  guid?: string;
  category?: string[];
  enclosure?: {
    url: string;
    length: number;
    type: string;
  };
  "content:encoded": string;
  "dc:creator": string;
  "dc:contributor": string;
  "atom:link": string;
  "media:content": {
    "media:credit": string;
    "media:title": string;
    "media:thumbnail": string;
  };
  "media:group": {
    "media:content": string[];
  };
  "media:thumbnail": string;
  "feedburner:origLink": string;
  "maz:template": string;
  "maz:modified": number;
}

export interface InputAtom {
  id: string;
  title: string;
  updated: string;
  link: string;
  author?: Person;
  generator?: string;
  subtitle?: string;
  rights?: string;
  entry: EntryFromAtomFeed[];
}

export interface EntryFromAtomFeed {
  id: string;
  title: string;
  link: string;
  content: string;
  summary?: string;
  published?: string;
  updated?: string;
  author?: Person;
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
