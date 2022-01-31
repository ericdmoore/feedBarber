/**
 * @Problem: Some feeds have rubbish filled in for the `content.[cdata | _text]`
 *            which acts like a teaser for the almost always ad-laiden full-site
 *            that will then show you the contnet
 *
 * @Overview: so addBody loads the full page for you, so you dont have to - and
 *             it sanitizes the html and drops a stripped down version of the site
              into the feed so you can read it like a book.
 */

// import type { RSS } from "../../types.ts"
// import { start } from "../start";

import { fetchSite } from '../analysis/fetchBody.ts';

export interface AddBodyParams {
	cssSelectors: string[];
	fetchParams: {
		credentials: {
			username: string;
			password: string;
		};
	};
}

export const addBody = (addBodyHere: string): Promise<null> => {
	return Promise.resolve(null);
};
