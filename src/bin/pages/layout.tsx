/** @jsx h */
import type { VNode } from 'https://deno.land/x/sift@0.4.3/mod.ts';
import { h, jsx } from 'https://deno.land/x/sift@0.4.3/mod.ts';

export const pageLayout = (
	Body: (() => VNode | h.JSX.Element),
	header?: VNode | h.JSX.Element,
): Response => {
	const Hdr = () => (
		<head>
			<title>Title</title>
			<meta charSet='utf-8' />
			<meta name='description' content=''></meta>
			<meta name='viewport' content='width=device-width, initial-scale=1'></meta>

			<meta property='og:title' content='' />
			<meta property='og:type' content='' />
			<meta property='og:url' content='' />
			<meta property='og:image' content='' />

			<link rel='icon' href='/favicon.ico' sizes='any' />
			<link rel='icon' href='/icon.svg' type='image/svg+xml' />
			<link rel='apple-touch-icon' href='icon.png' />

			<link rel='stylesheet' href='css/normalize.css' />
			<link rel='stylesheet' href='css/style.css' />

			<link rel='manifest' href='site.webmanifest' />
			<meta name='theme-color' content='#fafafa' />
		</head>
	);

	const ret = jsx(
		<html lang='en-US' charSet='UTF-8'>
			<Hdr />
			<Body />
		</html>,
	);
	// @todo add <!DOCTYPE html> to front
	return ret;
};

export default pageLayout;
