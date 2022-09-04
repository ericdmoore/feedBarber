/** @jsx h */
import { h, jsx, sift } from '../../mod.ts';

type Handler = sift.Handler;
export const createAcct: Handler = async (req, pathParam) => {
	return jsx(<h1>Create Account</h1>);
};

export default createAcct;
