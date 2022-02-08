/** @jsx h */
// import json from '../comps/responders/json.ts'
import {fetchAndValidateIntoAST} from '../../lib/start.ts'
import { Handler, json } from 'https://deno.land/x/sift@0.4.3/mod.ts';

const buildSearchParams = (req: Request)=>{
    const searchParams = {} as {[paramName:string]: string | string[] }
    const sp = new URL(req.url).searchParams
    sp.forEach((v,k,p)=>{
        console.log({v,k,p})
        if(k in searchParams){
            if(Array.isArray(searchParams[k])){
                searchParams[k] = [...searchParams[k], v]
            }
            else{
                searchParams[k] = [searchParams[k], v] as string[]
            }
        }else{
            searchParams[k] = v
        }
    })
    return searchParams
}

export const urlAST = '/ast/*'
export const echoAST: Handler = async (req, param) => {
    if(param?.url){
        const r = await fetchAndValidateIntoAST(param?.url)
                        .catch(()=> null)
        const searchParams = buildSearchParams(req)
        if(r){
            return json({
                _reflect: {
                    '@self': req?.url,
                    sourceURL: param?.url,
                    searchParams,
                },
                ...r,
            })
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