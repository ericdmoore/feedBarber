import { fetchAndValidateIntoAST } from '../lib/start.ts';

export const urls = {
	_sitemaps: [
		// 'https://danluu.com/sitemap.xml',
		// "https://flyingmeat.com/sitemap.xml",
		// "https://www.manton.org/sitemap.xml",
		// "https://timetable.manton.org/sitemap.xml",
		// 'https://thedefineddish.com/sitemap_index.xml',
	],
	_rss: [
		// "https://danluu.com/atom.xml", // is actually rss
		// "http://feeds.foxnews.com/foxnews/latest",
		// "https://rss.nytimes.com/services/xml/rss/nyt/US.xml",
		// "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
		// "https://www.huffpost.com/section/front-page/feed?x=1",
		// "http://feeds.foxnews.com/foxnews/latest",
		// "http://rssfeeds.usatoday.com/usatodaycomnation-topstories&x=1",
		// "https://lifehacker.com/rss",
		// "https://cdn.feedcontrol.net/8/1114-wioSIX3uu8MEj.xml",
		// "http://www.politico.com/rss/politicopicks.xml",
		// "https://feeds.npr.org/1002/rss.xml",
		// "https://feeds.npr.org/3/rss.xml",
		// 'https://randsinrepose.com/feed/',
	],
	_atom: [
		'https://aphyr.com/posts.atom',
		'http://composition.al/atom.xml',
		'https://world.hey.com/dhh/feed.atom',
		'https://erikbern.com/atom.xml',
		'https://feross.org/atom.xml',
		'https://archive.jlongster.com/atom.xml',
		'https://joshldavis.com/atom.xml',
		'https://www.smileykeith.com/atom.xml',
		'https://learnbyexample.github.io/atom.xml',
		'https://meowni.ca/atom.xml',
	],
	_jsonFeed: [
		// "https://daringfireball.net/feeds/json",
		// "http://maybepizza.com/feed.json",
		// "https://flyingmeat.com/blog/feed.json",
		// "http://shapeof.com/feed.json",
		// "https://hypercritical.co/feeds/main.json",
		// "https://inessential.com/feed.json",
		// "https://www.manton.org/feed.json",
		// "https://micro.blog/feeds/manton.json",
		// 'https://timetable.manton.org/feed.json',
		// 'http://therecord.co/feed.json',
		// 'http://www.allenpike.com/feed.json',
		// 'https://www.jsonfeed.org/feed.json',
	],
};

(async () => {
	// const allUrlsFetched =
	const rss = urls._rss as string[];
	const sm = urls._sitemaps as string[];
	const atom = urls._atom as string[];
	const jf = urls._atom as string[];

	await Promise.all(
		rss
			.concat(sm)
			.concat(atom)
			.concat(jf)
			.map(
				(url) =>
					fetchAndValidateIntoAST(url)
						.then((d) => {
							console.log({
								url,
								title: d.title,
								links: d.links,
								length: d.items,
							});
							return d;
						})
						.catch((er) => {
							console.error('CAUGHT THE ERROR in ', url);
							console.error(er);
							console.error(er.input._instruction);
							return null;
						}),
			),
	);
})();
