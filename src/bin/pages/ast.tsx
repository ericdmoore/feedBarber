/** @jsx h */
// import json from '../comps/responders/json.ts'
import {fetchAndValidateIntoAST} from '../../lib/start.ts'
import { Handler, json } from 'https://deno.land/x/sift@0.4.3/mod.ts';


export const urlAST = '/ast/*'
export const echoAST: Handler = async (req, param) => {
    return json({
        ...(param?.url
            ? {...await fetchAndValidateIntoAST(param?.url)}
            : {
                method: req.method, 
                referrer: req.referrer, 
                hdrs: req.headers,
                cache: req.cache,
                mode: req.mode,
                redirect: req.redirect,
                url: req.url,
                param
            }
        )
    })
}
export default echoAST