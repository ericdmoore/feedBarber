/** @jsx h */

import { h, jsx, sift } from '../../mod.ts';
type Handler = sift.Handler

export const logout: Handler = async (req, pathParam) => {
	return jsx(h('h1', {}, ['Logout']));
};

export default logout;
