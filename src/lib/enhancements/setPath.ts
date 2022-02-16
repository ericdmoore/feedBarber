import {ASTComputable} from '../../types.ts'
import {superstruct as s} from '../../mod.ts'
import er from '../parsers/helpers/error.ts';
import {setPath as setter} from '../utils/propertyPath.ts'

const {object, string} = s

export const SetPathParams = object({
    path: string(),
    value: string()
})

export const setPath =  (input: s.Infer<typeof SetPathParams> = {path: 'title', value:'Hello World Title!'}) => 
    async (_ast: Promise<ASTComputable>): Promise<ASTComputable>=>{
        if(SetPathParams.is(input)){
            return Promise.reject(er(input, '', new Error().stack ))
        }else{
            const ast = await _ast
            return ast
        }
    }
