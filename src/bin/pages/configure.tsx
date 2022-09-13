/** @jsx h */
/** @jsxFrag Fragment */

import { Fragment, h, sift, sheets, twind, jsx } from '../../mod.ts';
import funcMap from '../../lib/enhancements/index.ts';
import {setup, theme, tw } from './styles/base.tsx';
import { pageLayout, type ILayoutHeader } from './layout.tsx';
import { functions } from '../../lib/parsers/enhancementFunctions.ts';

type VNode = sift.VNode;
type Handler = sift.Handler;
type VirtualSheet = sheets.VirtualSheet;

const { virtualSheet, getStyleTagProperties } = sheets;

const twInlineStyle = (sheet: VirtualSheet) => {
	const { id, textContent } = getStyleTagProperties(sheet);
	return (
		<>
			{/* <style id={id}>{textContent}</style> */}
			<script src='https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio,line-clamp'></script>
		</>
	);
};

export const configure = (s = 'Configure Composition'): Handler =>
	(_req, pathParam) => {
		const sheet = virtualSheet();
		setup({ sheet, theme });

		const body = (
			<body>
				<h1 class={tw(`font-serif text(3xl slate-500)`)}>{s}</h1>
				<h1 class='font-serif text(3xl slate-500)'>{s}</h1>
				<h4>Direct Path Params</h4>
				<pre>
					{Object.entries({ ...pathParam })
						.map(([k, v]) => JSON.stringify({ [k]: v }))
						.join('\n')}
				</pre>

				<h4>Funcs</h4>
				{
					<pre>
						{
							// parseFunctions((pathParam ?? {})?.composition ?? 'none')
							// 	.map((f) => JSON.stringify(f, null, 2))
							// 	.join('\n')
						}
					</pre>
				}

				<p>Here we will</p>
				<ul>
					<li>
						<a href='#funcs'>Show all the functions to be used</a>
					</li>
					<li>Show all params setup for each function</li>
					<li>Sync the URL with function(param) and order</li>
				</ul>

				<h3 id='funcs'>Functions & Params</h3>
				<pre>
					{Object.entries(funcMap).map(([k, v]) => {
						return `${k} : ${JSON.stringify(JSON.parse(v.params.run), null, 2)}`;
					}).join('\n\n')}
				</pre>
			</body>
		);

		return pageLayout(() => body, { title: 'Feed City' }, () => twInlineStyle(sheet));
	};

export default configure;
