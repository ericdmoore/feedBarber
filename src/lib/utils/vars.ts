// const dt = Date.now()
// const epoch = Math.round(dt/1000)

type Dict<T> = { [key: string]: T };

export const envVar = async (key: string, overrideDict?: Dict<string>) => {
	const envFile = await import('../../../tests/.env.ts').catch(() => ({ default: {} }));
	const local = new Map(Object.entries({ ...envFile.default, ...overrideDict }));
	return local.get(key) ?? Deno.env.get(key);
};

export default envVar;
