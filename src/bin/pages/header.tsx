/** @jsx h */
import { h, Handler } from 'https://deno.land/x/sift@0.4.3/mod.ts';
import { ILayoutHeader, pageLayout } from './layout.tsx';

export const header: Handler = async (req, param = {}) => {
	const header: ILayoutHeader = { title: 'Feed City' };
	const body = (
		<body>
			<h1>Feed City</h1>
			<nav>
				<h3>Basics</h3>
				<ul>
					<li>
						<a href='/signin'>signin</a>
					</li>
					<li>
						<a href='/create'>create</a>
					</li>
					<li>
						<a href='/logout'>logout</a>
					</li>
					<li>
						<a href='/new'>newForm</a>
					</li>
					<li>
						<a href='/user'>user</a>
					</li>
				</ul>
				<h3>Full Monty</h3>
				<ul>
					<li>
						<a href='/t-1234sdfg2345'>temp token</a>
					</li>
					<li>
						<a href='/u-1234sdfg2345'>user token</a>
					</li>
					<li>
						<a href='/ast/https://danluu.com/sitemap.xml'>AST: DanLuu Sitemap</a>
					</li>
					<li>
						<a href='/ast/https://danluu.com/atom.xml'>AST: DanLuu Rss</a>
					</li>
					<li>
						<a href='/ast/https://randsinrepose.com/feed/'>AST: Rand Rss</a>
					</li>
					<li>
						<a href={`/ast/https://randsinrepose.com/feed?a=1&b=2`}>AST: Rand Rss (with params)</a>
					</li>
					<li>
						<a href={`/ast/addHash/https://randsinrepose.com/feed`}>AST: Rand Rss (with F.train)</a>
					</li>
					<li>
						<a href={`/u-ericdmoore/json/https://randsinrepose.com/feed`}>JSON: No Composition</a>
					</li>
					<li>
						<a href='/u-ericdmoore/json/f1(a=1|b=2)|>f2(c=a,b,c)/https://randsinrepose.com/feed'>
							JSON: Composition
						</a>
					</li>
					<li>
						<a href={`/u-ericdmoore/rss/https://randsinrepose.com/feed`}>RSS: No Composition</a>
					</li>
					<li>
						<a href={`/u-ericdmoore/atom/https://randsinrepose.com/feed`}>ATOM: No Composition</a>
					</li>
					<li>
						<a href='/u-ericdmoore/city/article(articleCss=I3ByaW1hcnk=)|>postLinks(nextPost=Lm5leHQ+YTpudGgtY2hpbGQoMik=|prevPost=LnByZXZpb3VzPmE6bnRoLWNoaWxkKDIp)|>hash()/https://randsinrepose.com/feed'>
							City: Rand with Comp Train
						</a>
					</li>
				</ul>
				<h3>Full Monty + Params</h3>
				<ul>
					<li>
						<a href='/t-1234sdfg2345?something=1&else=2'>temp token</a>
					</li>
					<li>
						<a href='/u-1234sdfg2345?preview&other=Thing&last=true'>user token</a>
					</li>
					<li>
						<a href='/ast/https://danluu.com/sitemap.xml?a=b&b=2'>DanLuu Sitemap</a>
					</li>
					<li>
						<a href='/ast/https://danluu.com/atom.xml?a=1&b=2'>DanLuu Rss</a>
					</li>
					<li>
						<a href={`/ast/https://randsinrepose.com/feed?a=1&b=2`}>Rand Repose Rss with params</a>
					</li>
				</ul>
			</nav>
		</body>
	);
	return pageLayout(() => body, header);
};

export default header;
