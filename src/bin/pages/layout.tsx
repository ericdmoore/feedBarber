/** @jsx h */
/** @jsxFrag Fragment */

import { Fragment, h, jsx, VNode } from 'https://deno.land/x/sift@0.4.3/mod.ts';
import { StringWriter } from 'https://deno.land/std@0.125.0/io/mod.ts';
import pumpReader from '../../lib/utils/pumpReader.ts';

export interface ILayoutHeader {
	title?: string;
	description?: string;
	og?: {
		title: string;
		type: string;
		url: string;
		image: string;
	};
}

export type JSXThunk = (() => VNode | h.JSX.Element);

export const pageLayout = async (
	Body: JSXThunk,
	hdr?: ILayoutHeader,
	Neck?: JSXThunk,
	Feet?: JSXThunk,
): Promise<Response> => {
	const Head = () => (
		<head>
			<title>{hdr?.title ?? 'TITLE'}</title>
			<meta charSet='utf-8' />
			<meta name='description' content={hdr?.description ?? ''}></meta>
			<meta name='viewport' content='width=device-width, initial-scale=1'></meta>

			<meta property='og:title' content={hdr?.og?.title ?? ''} />
			<meta property='og:type' content={hdr?.og?.type ?? ''} />
			<meta property='og:url' content={hdr?.og?.url ?? ''} />
			<meta property='og:image' content={hdr?.og?.image ?? ''} />

			<meta name='theme-color' content='#fafafa' />

			{/* <link rel='icon'  href='/favicon.ico' /> */}
			<link
				rel='icon'
				sizes='any'
				href='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏙</text></svg>'
			>
			</link>
			{/* <link rel='icon' type='image/svg+xml' href='/icon.svg' /> */}
			{/* <link rel='apple-touch-icon' href='icon.png' /> */}
			{/* <link rel='stylesheet' href='css/normalize.css' /> */}
			{/* <link rel='stylesheet' href='css/style.css' /> */}
			{/* <link rel='manifest' href='site.webmanifest' /> */}
			{Neck && <Neck></Neck>}
		</head>
	);

	const ret = jsx(
		<>
			<html lang='en-US' charSet='UTF-8'>
				<Head />
				<Body />
				{Feet && <Feet></Feet>}
			</html>
		</>,
	);

	const body = await pumpReader(ret.body, new StringWriter('<!DOCTYPE html>'));
	return new Response(body, {
		headers: ret.headers,
		status: ret.status,
		statusText: ret.statusText,
	});
};

export default pageLayout;
