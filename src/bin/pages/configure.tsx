/** @jsx h */
import { h, Handler, jsx } from 'https://deno.land/x/sift@0.4.3/mod.ts';

export const configure = (s = 'Configure Composition'): Handler =>
	async (req, pathParam) => {
		return jsx(
			<div>
				<h1>{s}</h1>
				<p>Here we will</p>
				<ul>
					<li>Show all the functions to be used</li>
					<li>Show all params setup for each function</li>
					<li>Sync the URL with function(param) and order</li>
				</ul>
			</div>,
		);
	};

export default configure;
