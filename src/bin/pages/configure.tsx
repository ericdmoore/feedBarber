/** @jsx h */
/** @jsxFrag Fragment */
import { Fragment, h, Handler, jsx, VNode } from 'https://deno.land/x/sift@0.4.3/mod.ts';
import { ILayoutHeader, pageLayout } from './layout.tsx';
import funcMap from '../../lib/enhancements/index.ts';

export const configure = (s = 'Configure Composition'): Handler =>
	async (req, pathParam) => {
		const header: ILayoutHeader = { title: 'Feed City' };
		const body = (
			<div>
				<h1>{s}</h1>

				<h4>Echo Path Params</h4>
				<pre>{JSON.stringify(pathParam)}</pre>

				<p>Here we will</p>
				<ul>
					<li>
						<a href='#funcs'>Show all the functions to be used</a>
					</li>
					<li>Show all params setup for each function</li>
					<li>Sync the URL with function(param) and order</li>
				</ul>

				<h3 id='funcs'>Functions &amp Params</h3>
				<pre>{JSON.stringify(funcMap, null, 2)}</pre>
			</div>
		);
		return pageLayout(() => body, header);
	};

export default configure;
