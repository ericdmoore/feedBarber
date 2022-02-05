/** @jsx h */
import json from '../comps/responders/json.ts'
import {fetchAndValidateIntoAST} from '../../lib/start.ts'
import { h, Handler, jsx, serve } from 'https://deno.land/x/sift@0.4.3/mod.ts';

export const astDisplay: Handler = async (req, param) => {
    // console.log('req.json(): \n', await req.json())
    return json({method: req.method, 
        referrer: req.referrer, 
        hdrs: req.headers,
        cache: req.cache,
        mode: req.mode,
        redirect: req.redirect,
        url: req.url,
        param,
        ...(param?.url ? {ast : await fetchAndValidateIntoAST(param.url)} : {})
    })
}
export default astDisplay