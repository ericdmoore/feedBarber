// import type {RSS, RssEntryFromFeed} from '../types'
// import  feedReader from "feed-reader"
// import { fromXml } from "../mod.ts";
// atom
// import { atom, rss } from "./parsers/index.ts";
import { parseAndPickType, typedValidation } from "./pickType.ts";

export const start = async (url: string) => {
  const remoteData = await fetch(url);
  return remoteData.text();
};

export const urls = {
  _sitemaps: [
    // "https://danluu.com/sitemap.xml",
    // "https://daringfireball.net/sitemap.xml",
    // "https://flyingmeat.com/sitemap.xml",
    // "https://www.manton.org/sitemap.xml",
    // "https://timetable.manton.org/sitemap.xml",
    "https://thedefineddish.com/sitemap_index.xml",
  ],
  _rss: [
    // "https://danluu.com/atom.xml", // is actually rss
    // "http://feeds.foxnews.com/foxnews/latest",
    // "https://rss.nytimes.com/services/xml/rss/nyt/US.xml",
    // "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
    // "https://www.huffpost.com/section/front-page/feed?x=1",
    // "http://feeds.foxnews.com/foxnews/latest",
    // "http://rssfeeds.usatoday.com/UsatodaycomNation-TopStories",
    // "https://lifehacker.com/rss",
    // "https://cdn.feedcontrol.net/8/1114-wioSIX3uu8MEj.xml",
    // "http://www.politico.com/rss/politicopicks.xml",
    // "https://feeds.npr.org/1002/rss.xml",
    // "https://feeds.npr.org/3/rss.xml",
    "https://randsinrepose.com/feed/",
  ],
  _atom: [
    // "https://aphyr.com/posts.atom",
    // "http://composition.al/atom.xml",
    // "https://world.hey.com/dhh/feed.atom",
    "https://erikbern.com/atom.xml",
    // "https://feross.org/atom.xml",
    // "https://archive.jlongster.com/atom.xml",
    // "https://joshldavis.com/atom.xml",
    // "https://www.smileykeith.com/atom.xml",
    // "https://learnbyexample.github.io/atom.xml",
    // "https://meowni.ca/atom.xml",
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
    "https://timetable.manton.org/feed.json",
    "http://therecord.co/feed.json",
    "http://www.allenpike.com/feed.json",
    "https://www.jsonfeed.org/feed.json",
  ],
};

(async () => {
  // const allUrlsFetched =
  await Promise.all(
    urls._sitemaps.map(
      (url) =>
        start(url)
          .then((txt) => parseAndPickType(txt))
          .then((d) => {
            console.log("0: ", d.data as any);
            return d;
          })
          .then((typedData) => typedValidation(typedData))
          .then((d) => {
            console.log("1: ", d);
            return d;
          })
          .then((t) => {
            if (t.kind === "rss") {
              console.log({
                url: t.data.rss.channel.link._text,
                numEntries: t.data.rss.channel.item.length,
                titles: t.data.rss.channel.item.map((i) => i.title._text),
              });
            }
            if (t.kind === "atom") {
              console.log({
                url: t.data.feed.link,
                numEntries: t.data.feed.entry.length,
                titles: t.data.feed.entry.map((i) => i),
              });
            }
            if (t.kind === "jsonFeed") {
              console.log({
                url: t.data.feed_url,
                numEntries: t.data.items.length,
                titles: t.data.items.map((v) => v.title ?? v.id),
              });
            }
            if (t.kind === "sitemap") {
              console.log({
                url,
                numEntries: t.data.urlset?.url.length,
                titles: t.data.urlset?.url.map((l) => l.loc._text),
              });
            }
            return t;
          })
          .catch((er) => {
            console.error("CAUGHT THE ERROR in ", url);
            console.error(er);
            console.error(er.input._microblog);
            return null;
          }),
    ),
  );
})();

export const load = start;
export default start;