/** @jsx h */
import { Fragment, h, jsx, sift } from '../../mod.ts';
type Handler = sift.Handler;

/**
 * STATE LOOK UP
 * - for user or state
 * @param tokenType
 */
export const ListFeedsFortoken = (tokenType: 'User' | 'Temp'): Handler =>
	async (req, pathParam) => {
		return jsx(<h1>{`Feeds For ${tokenType} Token`}</h1>);
	};

export default ListFeedsFortoken;
