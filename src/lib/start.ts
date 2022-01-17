// import type {RSS, RssEntryFromFeed} from '../types'
// import  feedReader from "feed-reader"
import {Atom} from "./parsers/atom.ts"

type Dict<T> = { [str: string]: string };

export const start = async (url: string) => {
  const remoteData = await fetch(url);
  return remoteData.text()
};

export const load = start;
export default start;

// deno-lint-ignore no-unused-vars
const rssUrls = [
  "http://feeds.foxnews.com/foxnews/latest",
  "https://rss.nytimes.com/services/xml/rss/nyt/US.xml",
  "https://www.huffpost.com/section/front-page/feed?x=1",
  "http://feeds.foxnews.com/foxnews/latest",
  "http://rssfeeds.usatoday.com/UsatodaycomNation-TopStories",
  "https://lifehacker.com/rss",
  "https://cdn.feedcontrol.net/8/1114-wioSIX3uu8MEj.xml",
  "http://www.politico.com/rss/politicopicks.xml",
  "https://feeds.npr.org/1002/rss.xml",
  "https://feeds.npr.org/3/rss.xml",
  // 'https://archive.nytimes.com/www.nytimes.com/services/xml/rss/index.html?mcubz=0',
];

const atomURLS = [
//   "https://aphyr.com/posts.atom",
//   "http://composition.al/atom.xml",
//   "https://erikbern.com/atom.xml",
  "https://feross.org/atom.xml",
  // 'https://archive.jlongster.com/atom.xml',
  // 'https://joshldavis.com/atom.xml',
  // 'https://www.smileykeith.com/atom.xml',
  // 'https://learnbyexample.github.io/atom.xml',
  // 'https://meowni.ca/atom.xml',
  // 'https://danluu.com/atom.xml',// actually rss
];
(async () => {

  // const allUrlsFetched = 
  await Promise.all(
    atomURLS.map(
      (u) =>
        start(u)
        .then(txt => Atom().parse(txt))
        .then(([err, data]) => {
            if(err){
              console.error('ERROR' , err)
              console.error('ERROR_data:' , data)
            }else{
              console.log('Data:', data)
            }
        })
        .catch((er) => {
            console.error("CAUGHT THE ERROR");
            console.error(u, er);
            return null;
          }),
    ),
  );


  // console.log(allUrlsFetched[3])

//   for (const TopKey in feed) {
//     console.log(TopKey);
//     console.log(JSON.stringify(feed[TopKey], null, 2));
//     if(TopKey === 'entry'){
//         for(const item of feed.entry as unknown as Dict<string>[]){
//             console.log(item)
//             for(const k2 in item){
//                 if(k2 ==='content'){
//                     for(const k3 in item.content as unknown as Dict<string>){
//                         console.log({k3})
//                         if(k3 !='_cdata'){
//                             const content = item.content as unknown as Dict<string>
//                             console.log(content[k3])
//                         }
//                     }
//                 }
//             }        
//         }
//     }
//   }

  // console.log({ childSet })
  // console.log({ grandSet })


})();
