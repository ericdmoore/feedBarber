import { join } from "https://deno.land/std@0.125.0/path/mod.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
// import puppeteer from "https://deno.land/x/puppeteer@9.0.2/mod.ts";

const nodeToPath = (initURL:URL) => (n : any) => {
    return (n.attributes?.href ?? '').startsWith('http') 
    ? n.attributes?.href
    : join(initURL.href, n.attributes?.href)
}

export const discover = async (inputUrl:string | URL) =>{
    const url = typeof inputUrl === 'string' ? new URL(inputUrl) : inputUrl
    const inputPageText = await (await fetch(url)).text()

    const doc = new DOMParser().parseFromString(inputPageText, "text/html")!;

    const rssAlts = doc.querySelectorAll('link[type="application/rss+xml" i]');
    const atomAlts = doc.querySelectorAll('link[type="application/atom+xml" i]');
    // const feedLinks = doc.querySelectorAll('link[type="application/atom+xml" i]');
    const clickableRss = doc.querySelectorAll('a[href*="rss.xml" i]');
    const clickableAtom = doc.querySelectorAll('a[href*="atom.xml" i]');

    const atomAltPaths = [...atomAlts].map(nodeToPath(url))
    const rssAltPaths = [...rssAlts].map(nodeToPath(url))
    const atomPaths = [...clickableAtom].map(nodeToPath(url))
    const rssPaths = [...clickableRss].map(nodeToPath(url))

    return [ ...atomAltPaths, ...rssAltPaths, ...atomPaths, ...rssPaths ]
}
