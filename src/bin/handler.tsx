/** @jsx h */

import { h, jsx, serve, PathParams } from 'https://deno.land/x/sift@0.4.3/mod.ts';
import configure from './pages/configure.tsx';
import create from './pages/create.tsx';
import logout from './pages/logout.tsx';
import newCompositionForm from './pages/new.tsx';
import preview from './pages/preview.tsx';
import proxy from './pages/proxy.ts';
import signin from './pages/signin.tsx';
import token from './pages/token.tsx';
import user from './pages/user.tsx';
import header from './pages/header.tsx';
import echoAST from './pages/ast.tsx';

// @see  NOTES from '../../notes/accounts.md'

const App = (title = 'Hello World!') => jsx(
	<div>
		<h1>{title}</h1>
	</div>
,{ status: 200 })

const NotFound = (req:Request, params: PathParams) => jsx(
	<div>
		<h1>Page Now Found</h1>
		<h3>Params</h3>
		<pre>{ JSON.stringify(params, null, 2) }</pre>  
		
		<h3 style="margin: 1em 0 0 0">Req</h3>
		<pre>{ JSON.stringify(req, null, 2) }</pre>
	</div>
,{ status: 404 })

serve({
	'/': header, // Home Page?
	'/user': user,
	'/create': create,
	'/signin': signin,
	'/logout': logout,
	'/new': newCompositionForm,
	'/ast/:url(.*)': echoAST,
	'/t-:tempToken': token('Temp'),
	'/u-:userToken': token('User'),

	// ???
	'/:tokType(u|t)-:token/:outputFmt': configure('Configure From Scratch'),
	'/:tokType(u|t)-:token/:outputFmt/:composition': configure('Configure Params for Composition'),
	
	// ???
	'/:tokType(u|t)-:token/:outputFmt/:composition/:url(.*)': proxy,
	'/:tokType(u|t)-:token/:outputFmt/:url(.*)': proxy,
	
	// ???
	'/:tokType(u|t)-:token/:outputFmt/:composition/preview': preview,
	'/:tokType(u|t)-:token/:outputFmt/:composition/preview/:url(.*)': preview,
	'/exhausted/:priorURL': () => App('Exhausted'), // Ask For Payment to bring it back
	404: (req, params) => NotFound(req, params),
});
