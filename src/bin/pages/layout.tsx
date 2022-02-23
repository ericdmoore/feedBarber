/** @jsx h */
/** @jsxFrag Fragment */

import { h, jsx, VNode, Fragment} from 'https://deno.land/x/sift@0.4.3/mod.ts';

export interface ILayoutHeader{
	title?: string
	description?: string
	og?: {
		title: string
		type: string
		url: string
		image: string
	}
}

export const pageLayout = (
	Body: (() => VNode | h.JSX.Element),
	hdr?: ILayoutHeader
): Response => {
	const Head = () => (
		<head>
			<title>{hdr?.title ?? 'TITLE'}</title>
			<meta charSet='utf-8'/>
			<meta name='description' content={hdr?.description ?? ''}></meta>
			<meta name='viewport' content='width=device-width, initial-scale=1'></meta>

			<meta property='og:title' content={hdr?.og?.title ?? ''} />
			<meta property='og:type' content={hdr?.og?.type ?? ''} />
			<meta property='og:url' content={hdr?.og?.url ?? ''} />
			<meta property='og:image' content={hdr?.og?.image ?? ''} />

			<meta name='theme-color' content='#fafafa' />

			{/* <link rel='icon' sizes='any' href='/favicon.ico' /> */}
			{/* <link rel='icon' type='image/svg+xml' href='/icon.svg' /> */}
			{/* <link rel='apple-touch-icon' href='icon.png' /> */}
			{/* <link rel='stylesheet' href='css/normalize.css' /> */}
			{/* <link rel='stylesheet' href='css/style.css' /> */}
			{/* <link rel='manifest' href='site.webmanifest' /> */}
		</head>
	);

	const ret = jsx(
		<>
			<html lang='en-US' charSet='UTF-8'>
				<Head/>
				<Body/>
			</html>,
		</>
	);

	// @todo add <!DOCTYPE html> to front
	return ret;
};

export default pageLayout;
