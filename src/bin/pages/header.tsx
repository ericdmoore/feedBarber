/** @jsx h */
import { h, Handler, jsx, serve } from 'https://deno.land/x/sift@0.4.3/mod.ts';

export const header:Handler = async (req, param = {})=> {
		return jsx(
            <div>
                <h1>Welcome to feed supply</h1>
                <nav>
                    <ul>
                        <li><a href='/signin'>signin </a></li>
                        <li><a href="/create">create</a></li>
                        <li><a href='/logout'>logout </a></li>
                        <li><a href='/new'> newForm </a></li>
                        <li><a href='/user'>user </a></li>
                        <li><a href='/ast/https://danluu.com/sitemap.xml'>DanLuu Sitemap</a></li>
                        <li><a href='/ast/https://danluu.com/atom.xml'>DanLuu Rss</a></li>
                        <li><a href='/ast/https://randsinrepose.com/feed/'>Rand Repose Rss</a></li>
                    </ul>
                </nav>
            </div>
        )
	};

export default header;
