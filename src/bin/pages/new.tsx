/** @jsx h */

import { h, Handler, jsx } from 'https://deno.land/x/sift@0.4.3/mod.ts';

// Eventaully populate this with Popular compositions
// or Even Pppular Whlole Composed Feeds
//  how to clean up the NYT / WaPo / Medium / Substack
//

export const newFeedForm: Handler = async (req, pathParam) => {
	return jsx(h('h1', {}, ['New Form']));
};

export default newFeedForm;
