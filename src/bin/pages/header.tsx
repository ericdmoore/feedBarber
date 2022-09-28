/** @jsx h */
import { h, sift } from "../../deps.ts";
type Handler = sift.Handler;
import { ILayoutHeader, pageLayout } from "./layout.tsx";
import {
  type FunctionPathBuilderInputDict,
  functions,
} from "../../lib/parsers/enhancementFunctions.ts";

const EchoLink = (p: { href: string }) => (
  <li>
    <a href={`/${p.href}`}>{p.href}</a>
  </li>
);

const funcHref = async (
  prefix: string,
  p: FunctionPathBuilderInputDict,
  trailSlash = false,
) => {
  const pref = prefix.endsWith("/") ? prefix : `${prefix}/`;
  return `${pref}${(await functions.stringify()(p)).right}${
    trailSlash ? "/" : ""
  }`;
};

export const header: Handler = async (_req, _con) => {
  const header: ILayoutHeader = { title: "Feed City" };
  const body = (
    <body>
      <h1>Feed City</h1>
      <nav>
        <h3>Basics</h3>
        <ul>
          <EchoLink href="signin" />
          <EchoLink href="create" />
          <EchoLink href="logout" />
          <EchoLink href="new" />
          <EchoLink href="user" />
        </ul>
        <h3>Full Monty</h3>
        <ul>
          <EchoLink href="t-1234sdfg2345" />
          <EchoLink href="t-1234sdfg2345?something=1&else=2" />
          <EchoLink href="u-1234sdfg2345" />
          <EchoLink href="u-ericdmoore/json/https://randsinrepose.com/feed" />
          <EchoLink href="u-ericdmoore/rss/https://randsinrepose.com/feed" />
          <EchoLink href="u-ericdmoore/atom/https://randsinrepose.com/feed" />
          {/* <EchoLink href='u-ericdmoore/city/article(articleCss:I3ByaW1hcnk=)|postLinks(nextPost:Lm5leHQ+YTpudGgtY2hpbGQoMik=,prevPost:LnByZXZpb3VzPmE6bnRoLWNoaWxkKDIp)|hash()/https://randsinrepose.com/feed' /> */}
          <EchoLink
            href={await funcHref(`u-ericdmoore/city/`, {
              a: { param1: "hello World" },
            })}
          />
          <EchoLink href="u-1234sdfg2345?preview&other=Thing&last=true" />
        </ul>
      </nav>
    </body>
  );
  return pageLayout(() => body, header);
};

export default header;
