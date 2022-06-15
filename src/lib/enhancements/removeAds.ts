import {PromiseOr, AST} from '../../types.ts'

export interface RemoveAdsParams {
	elementBanList: string;
}

export const removeAds = (params: RemoveAdsParams) => async (_ast: PromiseOr<AST>) => {

};
