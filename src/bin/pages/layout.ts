/** @jsx h */
import type { Handler, VNode } from 'https://deno.land/x/sift@0.4.3/mod.ts';
import { h, jsx } from 'https://deno.land/x/sift@0.4.3/mod.ts';


export const pageLayout = (header: VNode | h.JSX.Element, bod: VNode | h.JSX.Element, htmlAttrs = {})=>{
    const ret = jsx(
        <html lang="en" charSet='UTF-8'>
            <head>
                {header}
            </head>
            <body>
                {bod}
            </body>
        </html>
    )
    // @todo add <!DOCTYPE html> to front
    return ret
}
export default pageLayout