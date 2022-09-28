/** @jsx h */

import { path, sift } from "../../deps.ts";

export const serveStatic = (mountDir: string) =>
  (async (req) => {
    const reqpath = new URL(req.url);
    return new Response(
      await Deno.readFile(
        path.resolve(mountDir, reqpath.pathname, reqpath.search, reqpath.hash),
      ),
    );
  }) as sift.Handler;

export default serveStatic;
