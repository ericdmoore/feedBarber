/** @jsx h */

import { h, jsx, sift } from "../../deps.ts";
type Handler = sift.Handler;

export const logout: Handler = (req, pathParam) => {
  return jsx(h("h1", {}, ["Logout"]));
};

export default logout;
