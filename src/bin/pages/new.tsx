/** @jsx h */

import { h, jsx, sift } from "../../deps.ts";
type Handler = sift.Handler;

// Eventaully populate this with Popular compositions
// or Even Pppular Whlole Composed Feeds
//  how to clean up the NYT / WaPo / Medium / Substack
//

export const newFeedForm: Handler = (req, _con, _pathParam) => {
  return jsx(h("h1", {}, ["New Form"]));
};

export default newFeedForm;
