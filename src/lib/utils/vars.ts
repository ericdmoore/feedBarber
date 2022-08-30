import * as dotenv from 'https://deno.land/std@0.153.0/dotenv/mod.ts';
import { resolve } from 'https://deno.land/std@0.153.0/path/mod.ts';

export const envVar = (defaultVal: string) =>
	async (key: string): Promise<string> => {
		const path = resolve(import.meta.url, '../.env').split(':')[1]; // crazy `file:` prefix after import.meta.url
		const configState = await dotenv.config({ path, safe: true, allowEmptyValues: false, export: true });

		Object.entries(configState)
			.forEach(([key, value]) => {
				Deno.env.set(key, value);
			});

		return Deno.env.get(key) ?? defaultVal;
	};

export default envVar;

// (async ()=>{
// 	console.log(await envVar('')('REGION'))
// })()
