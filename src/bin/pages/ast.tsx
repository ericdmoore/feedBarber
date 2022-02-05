/** @jsx h */
import json from '../comps/responders/json.ts'
import { h, Handler, jsx, serve } from 'https://deno.land/x/sift@0.4.3/mod.ts';

export const astDisplay: Handler = async (req, param) => {
    return json({req: JSON.stringify(req), request:req.toString(), param})
}
export default astDisplay