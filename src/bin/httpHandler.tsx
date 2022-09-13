/** @jsx h */

import { h, jsx, serve } from "../deps.ts";
import configure from "./pages/configure.tsx";
import create from "./pages/create.tsx";
import logout from "./pages/logout.tsx";
import newCompositionForm from "./pages/new.tsx";
import preview from "./pages/preview.tsx";
import proxy from "./pages/proxy.ts";
import signin from "./pages/signin.tsx";
import token from "./pages/token.tsx";
import user from "./pages/user.tsx";
import header from "./pages/header.tsx";
import echoAST from "./pages/ast.tsx";

// const {h, jsx, serve} = sift

const Title = (title = "Hello World!") =>
  jsx(
    <div>
      <h1>{title}</h1>
    </div>,
    { status: 200 },
  );

const NotFound = (req: Request) =>
  jsx(
    <div>
      <h1>Page Not Found</h1>
      <h3 style="margin: 1em 0 0 0">Req</h3>
      <pre>{JSON.stringify({ hdrs: req.headers, url: req.url }, null, 2)}</pre>
    </div>,
    { status: 404 },
  );

serve({
  "/": header, // Home Page?
  "/user": user,
  "/create": create,
  "/signin": signin,
  "/logout": logout,
  "/new": newCompositionForm,
  "/ast/:url(http.*)": echoAST,
  "/ast/:composition/:url(http.*)": echoAST,
  "/t-{:tempToken}": token("Temp"),
  "/u-{:userToken}": token("User"),

  "/:tokType(u|t)-:token/{:outputFmt}": configure("Configure From Scratch"), // builder
  "/:tokType(u|t)-:token/:outputFmt/{:composition}": configure(
    "Configure Params for Composition",
  ), // missing url, so view config and preview a feed

  "/:tokType(u|t)-:token/:outputFmt/:url(http.*)": proxy,
  "/:tokType(u|t)-:token/:outputFmt/:composition/:url(http.*)": proxy, // merge ?

  // '/:tokType(u|t)-:token/:outputFmt/:composition/preview': preview,
  "/:tokType(u|t)-:token/:outputFmt/:composition/preview/:url(http.*)": preview, // might be
  "/exhausted/:priorURL": () => Title("Exhausted"), // Ask For Payment to bring it back
  404: (req, params) => NotFound(req),
});
