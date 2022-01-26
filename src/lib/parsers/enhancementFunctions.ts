
export const parseFunctions = (path: string) => {
    const unencoded = decodeURIComponent(path)
    const removedEndSlash = unencoded.endsWith('/') ? unencoded.slice(0,-1) : unencoded
    
    const tokens = removedEndSlash
        .split('||')
        .map(fc => {
        const [f, pStr] = fc.split('(')
        return { fname: f, 
                    paramStr: !pStr ? null : pStr.slice(0,-1)
            }
        })
     const token2 = tokens.map(i => typeof i.paramStr === 'string' 
        ? {fName: i.fname, namedParamVals : Object.fromEntries(i.paramStr.split('|').map(s => s.split('='))) as {[paramName:string]:string} }
        : {fName: i.fname, namedParamVals : {} as {[paramName:string]:string} }
    )

    const removedExtraQuotes = token2.map(t=>{
        const fixedTuples : [string, string | undefined][] = Object.entries(t.namedParamVals)
            .map(([k,v] :[string, string | undefined])=>{
                if(v?.startsWith("'")){ v = v?.slice(1) }
                if(v?.endsWith("'")){ v = v?.slice(0,-1) }
                return [k.trim(), v?.trim()]
            })
        
        return {fname: t.fName, 
            params: fixedTuples.reduce((p,[k,v])=>{
                if(k.length === 0){ return p }
                if(typeof v ==='undefined' || v === null ){ return p }
                return {...p,[k]:v}
            },{} as {[name:string]:string})
        }
    })
    
    const objectToUndef = removedExtraQuotes.map(f=> Object.keys(f.params).length === 0 
        ? {fname: f.fname, params: undefined}
        : f
    )
    return objectToUndef
}


const test1 = `preview()||addBody(css='a'|%20root='#main%20')||rmAds(list='')||addsubs/`
// const test2 = `preview(show=false)||addBody(css='a'|root='#main')||rmAds(list='')||addsubs/`

console.log(parseFunctions(test1))