/** @jsx h */

import { h, jsx, serve } from 'https://deno.land/x/sift@0.4.3/mod.ts';
import configure from './pages/configure.tsx';
import create from './pages/create.tsx';
import logout from './pages/logout.tsx';
import newForm from './pages/new.tsx';
import preview from './pages/preview.tsx';
import proxy from './pages/proxy.ts';
import signin from './pages/signin.tsx';
import token from './pages/token.tsx';
import user from './pages/user.tsx';
import header from './pages/header.tsx'
import echoAST from './pages/ast.tsx';

// @see  NOTES from '../../notes/accounts.md'

const App = (title = 'Hello World!') => h('div', {}, [h('h1', {}, [title])]);

const NotFound = () =>
	h('div', {}, [
		h('h1', {}, ['Page not found']),
	]);

serve({
	'/': header, // Home Page?
	// '/favicon.ico:' : Favicon,
	'/create': create,
	'/signin': signin,
	'/logout': logout,
	'/new': newForm,
	'/user': user,
	'/ast/:url(.*)' : echoAST,
	'/t-:tempToken': token("Temp"),
	'/u-:userToken': token("User"),
	'/(u|t)-:userOrTempToken/:outputFmt/': configure('Configure From Scratch'),
	'/(u|t)-:userOrTempToken/:outputFmt/:composition': configure(),
	'/(u|t)-:userOrTempToken/:outputFmt/:composition/:url': proxy,
	'/(u|t)-:userOrTempToken/:outputFmt/:composition/preview/:url': preview,
	'/exhausted/:priorURL': () => jsx(App('Exhausted')), // Ask For
	404: () => jsx(NotFound(), { status: 404 }),
});
