import { json, Handler} from 'https://deno.land/x/sift@0.4.3/mod.ts';

export const proxy:Handler = async (req, params): Promise<Response> => {
	
	return json({
		title: 'PROXY URL',
		_reflect:{
			params,
			req: {...req}
		}
	}, { status: 200 });
};
export default proxy;
