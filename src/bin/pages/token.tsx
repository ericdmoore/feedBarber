/** @jsx h */
import { Fragment, h, jsx, sift } from "../../deps.ts";
type Handler = sift.Handler;

/**
 * STATE LOOK UP
 * - for user or state
 * @param tokenType
 */
export const ListFeedsFortoken =
  (tokenType: "User" | "Temp"): Handler => (_req, _con, pathParam) => {
    return jsx(<h1>{`Feeds For ${tokenType} Token`}</h1>);
  };

export default ListFeedsFortoken;
