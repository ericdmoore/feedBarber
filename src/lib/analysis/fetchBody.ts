import { cheerio } from '../../mod.ts'

export const fetchSite = async(url: string | URL) =>  {
    const _url = typeof url === 'string' ? url : url.toString()
    return (await fetch(_url)).text()
}

export const extractArticleContainer = async (url: string | URL, cssSelector: string) => {
    const $ = cheerio.cheerio.load(await fetchSite(url))
    return $(cssSelector).text
}




