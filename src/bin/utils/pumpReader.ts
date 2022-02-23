import { StringWriter } from 'https://deno.land/std@0.125.0/io/mod.ts';

export const readToString = async (
	rs: ReadableStream<Uint8Array> | null,
	s = new StringWriter(''),
) => {
	if (!rs) return '';
	else {
		for await (const line of rs) { s.write(line) }
		return s.toString();
	}
};
export default readToString;