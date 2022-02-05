/** @jsx h */
import { h, Handler, jsx, serve } from 'https://deno.land/x/sift@0.4.3/mod.ts';

export const configure = (s: string = 'Configure Composition'): Handler =>
	async (req, pathParam) => {
		return jsx(h('h1', {}, [s]));
	};

export default configure;
