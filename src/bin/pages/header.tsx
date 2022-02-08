/** @jsx h */
import type { Handler, VNode } from 'https://deno.land/x/sift@0.4.3/mod.ts';
import { h, jsx } from 'https://deno.land/x/sift@0.4.3/mod.ts';
import pageLayout from './layout.ts'

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

export const header:Handler = async (req, param = {})=> {
    const header = (<title>Feed Supply</title>)
    const body = (
            <div>
                <h1>Welcome to feed supply</h1>
                <nav>
                    <h3>Basics</h3>
                    <ul>
                        <li><a href='/signin'>signin </a></li>
                        <li><a href="/create">create</a></li>
                        <li><a href='/logout'>logout </a></li>
                        <li><a href='/new'> newForm </a></li>
                        <li><a href='/user'>user </a></li>
                    </ul>
                    <h3>Full Monty</h3>
                    <ul>
                        <li><a href='/t-1234sdfg2345'>temp token</a></li>
                        <li><a href='/u-1234sdfg2345'>user token</a></li>
                        <li><a href='/ast/https://danluu.com/sitemap.xml'>DanLuu Sitemap</a></li>
                        <li><a href='/ast/https://danluu.com/atom.xml'>DanLuu Rss</a></li>
                        <li><a href='/ast/https://randsinrepose.com/feed/'>Rand Repose Rss</a></li>
                        <li><a href={`/ast/https://randsinrepose.com/feed?a=1&b=2`}>Rand Repose Rss with params</a></li>
                    </ul>
                    <h3>Full Monty +  Params</h3>
                    <ul>
                        <li><a href='/t-1234sdfg2345?something=1&else=2'>temp token</a></li>
                        <li><a href='/u-1234sdfg2345?preview&other=Thing&last=true'>user token</a></li>
                        <li><a href='/ast/https://danluu.com/sitemap.xml?a=b&b=2'>DanLuu Sitemap</a></li>
                        <li><a href='/ast/https://danluu.com/atom.xml?a=1&b=2'>DanLuu Rss</a></li>
                        <li><a href={`/ast/https://randsinrepose.com/feed?a=1&b=2`}>Rand Repose Rss with params</a></li>
                    </ul>
                </nav>
            </div>
        )

    return pageLayout(header, body)
	};

export default header;
