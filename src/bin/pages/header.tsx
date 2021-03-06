/** @jsx h */
import { h, Handler } from 'https://deno.land/x/sift@0.4.3/mod.ts';
import { ILayoutHeader, pageLayout } from './layout.tsx';

const EchoLink = (p: { href: string }) => (
	<li>
		<a href={`/${p.href}`}>{p.href}</a>
	</li>
);

export const header: Handler = async (req, param = {}) => {
	const header: ILayoutHeader = { title: 'Feed City' };
	const body = (
		<body>
			<h1>Feed City</h1>
			<nav>
				<h3>Basics</h3>
				<ul>
					<EchoLink href='signin' />
					<EchoLink href='create' />
					<EchoLink href='logout' />
					<EchoLink href='new' />
					<EchoLink href='user' />
				</ul>
				<h3>Full Monty</h3>
				<ul>
					<EchoLink href='t-1234sdfg2345' />
					<EchoLink href='t-1234sdfg2345?something=1&else=2' />
					<EchoLink href='u-1234sdfg2345' />
					<EchoLink href='u-ericdmoore/json/https://randsinrepose.com/feed' />
					<EchoLink href={`u-ericdmoore/json/f1(a:1,b:2)|f2(c:${btoa('a,b,c')})/https://randsinrepose.com/feed`} />
					<EchoLink href='u-ericdmoore/rss/https://randsinrepose.com/feed' />
					<EchoLink href='u-ericdmoore/atom/https://randsinrepose.com/feed' />
					<EchoLink href='u-ericdmoore/city/article(articleCss:I3ByaW1hcnk=)|postLinks(nextPost:Lm5leHQ+YTpudGgtY2hpbGQoMik=,prevPost:LnByZXZpb3VzPmE6bnRoLWNoaWxkKDIp)|hash()/https://randsinrepose.com/feed' />
					<EchoLink href='u-1234sdfg2345?preview&other=Thing&last=true' />
				</ul>
			</nav>
		</body>
	);
	return pageLayout(() => body, header);
};

export default header;
