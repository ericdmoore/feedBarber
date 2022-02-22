import type {PromiseOr, ASTComputable} from '../../types.ts'
import { addHash } from './addHash.ts'
import { addFetchedSite } from './fetchSite.ts'

export const funcMap = {
    addHash : addHash,
    addSite : addFetchedSite,
} as {[fname:string] : (i:unknown)=>(ast: PromiseOr<ASTComputable>)=>Promise<ASTComputable>} 
export default funcMap