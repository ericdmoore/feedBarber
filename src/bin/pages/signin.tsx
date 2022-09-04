/** @jsx h */

import { Fragment, h, jsx, sift } from '../../mod.ts';
type Handler = sift.Handler

export const signin: Handler = async (req, pathParam) => {
	return jsx(h('h1', {}, ['Signin']));
};

export default signin;
