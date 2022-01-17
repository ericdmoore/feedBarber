import type { RSS } from "../../types";
import { start } from "../start";
import fetch from "node-fetch";

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
} // export const addCorpus = (feedURL:string, params?:AddBodyParams) => async (rss:RSS) => {

//     rss.entries = rss.entries.map( ent => {
//         ent
//         return null
//     })

//     const body = await fetch(rss.link ?? '')
//     console.log({body})

//     return rss.
// }

(async () => {
  await start("https://feeds.simplecast.com/54nAGcIl");
  // await addBody()
})();

// export default addCorpus
