/** @jsx h */

import { Fragment, h, jsx, sift } from "../../deps.ts";
type Handler = sift.Handler;

export const signin: Handler = (req, pathParam) => {
  return jsx(h("h1", {}, ["Signin"]));
};

export default signin;
