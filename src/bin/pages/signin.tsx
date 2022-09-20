/** @jsx h */

import { Fragment, h, jsx, sift } from "../../deps.ts";
type Handler = sift.Handler;

export const signin: Handler = (_req, _con, pathParam) => {
  return jsx(h("h1", {}, ["Signin"]));
};

export default signin;
