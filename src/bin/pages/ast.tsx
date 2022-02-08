/** @jsx h */
// import json from '../comps/responders/json.ts'
import {fetchAndValidateIntoAST} from '../../lib/start.ts'
import { Handler, json } from 'https://deno.land/x/sift@0.4.3/mod.ts';


export const urlAST = '/ast/*'
export const echoAST: Handler = async (req, param) => {
    if(param?.url){
        const r = await fetchAndValidateIntoAST(param?.url)
                        .catch(()=> null)
        if(r){
            return json(r)
        }else{
            return json({
                method: req.method, 
                referrer: req.referrer, 
                hdrs: req.headers,
                cache: req.cache,
                mode: req.mode,
                redirect: req.redirect,
                url: req.url,
                param
            })
        } 
    }else{
        return json({
            method: req.method, 
            referrer: req.referrer, 
            hdrs: req.headers,
            cache: req.cache,
            mode: req.mode,
            redirect: req.redirect,
            url: req.url,
            param
        })

    }
}
export default echoAST