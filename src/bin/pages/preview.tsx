/** @jsx h */
import { h, jsx, sift } from "../../deps.ts";
type Handler = sift.Handler;

export const preview: Handler = (req, pathParam) => {
  return jsx(
    <h1>The Preview</h1>,
  );
};

export default preview;
