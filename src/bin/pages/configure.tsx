/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h, Handler, jsx, VNode } from 'https://deno.land/x/sift@0.4.3/mod.ts';
import { ILayoutHeader, pageLayout } from './layout.tsx';
import funcMap from '../../lib/enhancements/index.ts';
import {parseFunctions} from '../../lib/parsers/enhancementFunctions.ts'

export const configure = (s = 'Configure Composition'): Handler =>
	async (req, pathParam) => {
		const header: ILayoutHeader = { title: 'Feed City' };
		const body = (
			<div>
				<h1>{s}</h1>

				<h4>Direct Path Params</h4>
				<pre>{
					Object.entries({...pathParam})
						.map(([k,v])=> JSON.stringify({[k]:v}))
						.join('\n')
				}</pre>

				<h4>Funcs</h4>
				<pre>{
					parseFunctions((pathParam ?? {})?.composition ?? 'none')
						.map(f=>JSON.stringify(f,null, 2))
						.join('\n')
				}</pre>

				<p>Here we will</p>
				<ul>
					<li>
						<a href='#funcs'>Show all the functions to be used</a>
					</li>
					<li>Show all params setup for each function</li>
					<li>Sync the URL with function(param) and order</li>
				</ul>

				<h3 id='funcs'>Functions & Params</h3>
				<pre>{ 
					Object.entries(funcMap).map(([k,v])=>{
						return `${k} : ${JSON.stringify(JSON.parse(v.param),null, 2)}`
					}).join('\n\n')
				}</pre>
			</div>
		);
		return pageLayout(() => body, header);
	};

export default configure;
