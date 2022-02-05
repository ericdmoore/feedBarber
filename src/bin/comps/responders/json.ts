
export const json = (i: Response | unknown)=>{
    if(i instanceof Response){
        return new Response( i.body ,{headers:{'content-type':'application/json'}})
    }else{
        return new Response(JSON.stringify(i),{headers:{'content-type':'application/json'}})
    }
}
export default json