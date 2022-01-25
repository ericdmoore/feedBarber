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

export interface AddBodyParams {
  cssSelector: string[];
  editURLtmpl: string;
  fetchParams: {
    credentials: {
      username: string;
      password: string;
    };
    allowedDomains: string[];
  };
}

// export const addCorpus = (feedURL:string, params?:AddBodyParams) => async (rss:RSS) => {

//     rss.entries = rss.entries.map( ent => {
//         ent
//         return null
//     })

//     const body = await fetch(rss.link ?? '')
//     console.log({body})

//     return rss.
// }

(async () => {
  // await start("https://feeds.simplecast.com/54nAGcIl");
  // await addBody()
})();

// export default addCorpus
