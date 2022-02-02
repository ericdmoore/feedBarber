
import * as server from "https://deno.land/std@0.114.0/http/server.ts";
console.log("Listening on http://localhost:8000");

server.serve((_req:Request, _ctx: server.ConnInfo) => {
  return new Response("Hello World!", {
    headers: { "content-type": "text/plain" },
  });
});