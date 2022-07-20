import { Buffer } from "https://deno.land/std@0.144.0/streams/mod.ts";

const encoder = new TextEncoder()

export const s3Mock = (state: Map<string, Uint8Array> = new Map<string, Uint8Array>())=>({
    putObject: async (key: string, data: object | string | Uint8Array):Promise<Uint8Array>=>{ 
        const val = typeof data ==='string' 
            ? encoder.encode(data) 
            : data instanceof Uint8Array
                ? data
                : encoder.encode(JSON.stringify(data)) 
        state.set(key, val)
        return val
    },
    getObject : async (key: string )=>{
        const data = state.get(key)
        return data 
            ? { body: new Buffer(data).readable }
            : Promise.reject({err:'Object Not Found', code: 404})
    },
})