export const proxy = async (): Promise<Response> => {
	return new Response('', { status: 200 });
};
export default proxy;
