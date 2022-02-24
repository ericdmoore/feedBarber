/** @jsx h */
import { h, Handler, jsx } from 'https://deno.land/x/sift@0.4.3/mod.ts';
import funcMap from '../../lib/enhancements/index.ts'

export const configure = (s = 'Configure Composition'): Handler =>
	async (req, pathParam) => {
		return jsx(
			<div>
				<h1>{s}</h1>
				<p>Here we will</p>
				<ul>
					<li><a href='#funcs'> Show all the functions to be used</a></li>
					<li>Show all params setup for each function</li>
					<li>Sync the URL with function(param) and order</li>
				</ul>

				<h3 id='funcs'>Functions</h3>
				<pre>{JSON.stringify(funcMap,null,2)}</pre>

				<h3 id='params'>Functions</h3>
				<pre>{JSON.stringify(funcMap,null,2)}</pre>

			</div>,
		);
	};

export default configure;
