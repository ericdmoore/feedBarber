import { AST, PromiseOr } from '../../types.ts';

export interface RemoveAdsParams {
	elementBanList: string;
}

export const removeAds = (_params: RemoveAdsParams) => async (_ast: PromiseOr<AST>) => {
};
