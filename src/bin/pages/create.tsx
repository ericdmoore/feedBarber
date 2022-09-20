/** @jsx h */
import { h, jsx, sift } from "../../deps.ts";

type Handler = sift.Handler;
export const createAcct: Handler = () => {
  return jsx(<h1>Create Account</h1>);
};

export default createAcct;
