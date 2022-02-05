/** @jsx h */
import json from '../comps/responders/json.ts'
import { h, Handler, jsx, serve } from 'https://deno.land/x/sift@0.4.3/mod.ts';

export const astDisplay: Handler = async (req, param) => {
    console.log('req.json(): \n',await req.json())
    return json({req: await req.text(), param})
}
export default astDisplay