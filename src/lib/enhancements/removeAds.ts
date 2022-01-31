import { RSS } from '../../types';

export interface RemoveAdsParams {
	elementBanList: string;
}

export const removeAds = (params: RemoveAdsParams) =>
	async (rss: RSS) => {
	};
