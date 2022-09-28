/** @jsx h */
/** @jsxFrag Fragment */

import { Fragment, h, jsx, sheets, sift, twind } from "../../deps.ts";
import { moduleMap } from "../../lib/enhancements/index.ts";
import { setup, theme, tw } from "./styles/base.tsx";
import {
  pageLayout,
  // type ILayoutHeader
} from "./layout.tsx";

import { functions } from "../../lib/parsers/enhancementFunctions.ts";

// type VNode = sift.VNode;
type Handler = sift.Handler;
type VirtualSheet = sheets.VirtualSheet;

const { virtualSheet, getStyleTagProperties } = sheets;
const sheet = virtualSheet();
setup({ sheet, theme });

const twInlineStyle = (sheet: VirtualSheet) => {
  const { id, textContent } = getStyleTagProperties(sheet);
  return (
    <>
      
      {/* <script defer src="/sa/fa/js/brands.min.js"></script> */}
      {/* <script defer src="/sa/fa/js/solid.min.js"></script> */}
      {/* <script defer src="/sa/fa/js/fontawesome.min.js"></script> */}
      {/* <script src="https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio,line-clamp"></script> */}
      <style id={id}>{textContent}</style>
    </>
  );
};

/*
- Configure the functions in the URL bar
- Add other functions to the URL bar

- Show form elements based on json schema
- submit redirects the URL to one containing the validated elements

*/

export const configure = (s = "Configure Composition") => {

  // const sheet = virtualSheet();

  return ((_req, _con, _pathParam) => {  
      const body = (
        <body class={tw('max-w-2xl m-auto')}>
          <h1 class={tw('font-serif text(3xl purple-500)')}>{s}</h1>
  
          <ul class={tw(`list-disc`)}>
            <li>
              <a href="#funcs">Function Menu</a> w/ Params Schemas
            </li>
            <li>Sync the URL with function(param) and order</li>
          </ul>
  
          <h3 id="funcs" class={tw(`mt-6`)}>Functions & Param List</h3>
  
          {/* parse | stringify for the object-based pretty print */}
  
          <div>
            {Object.entries(moduleMap).map(([k, v]) => {
              return (
                <details>
                  <summary>{k}</summary>
                  <pre> {JSON.stringify(JSON.parse(v.paramsSchema.run), null, 2)}</pre>
                </details>
              );
            })}
          </div>
        </body>
      );
  
      return pageLayout(
        () => body,
        {
          title: "Feed City",
          description: s,
          og: {
            url: "https://feeds.city",
            title: "Feeds City",
            type: "website",
            image: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏙</text></svg>",
          },
        },
        () => twInlineStyle(sheet),
      );
    }) as Handler;
}





export default configure;
