export const parseFunctions = (compositinPath: string) => {
	const unencoded = decodeURIComponent(compositinPath);
	const removedEndSlash = unencoded.endsWith('/') ? unencoded.slice(0, -1) : unencoded;

	const tokens = removedEndSlash
		.split('||')
		.map((fc) => {
			const [f, pStr] = fc.split('(');
			return { fname: f, paramStr: !pStr ? null : pStr.slice(0, -1) };
		});
	const token2 = tokens.map((i) =>
		typeof i.paramStr === 'string'
			? {
				fName: i.fname,
				namedParamVals: Object.fromEntries(
					i.paramStr.split('|').map((s) => s.split('=')),
				) as { [paramName: string]: string },
			}
			: {
				fName: i.fname,
				namedParamVals: {} as { [paramName: string]: string },
			}
	);

	const removedExtraQuotes = token2.map((t) => {
		const fixedTuples: [string, string | undefined][] = Object.entries(
			t.namedParamVals,
		)
			.map(([k, v]: [string, string | undefined]) => {
				if (v?.startsWith('\'')) v = v?.slice(1);
				if (v?.endsWith('\'')) v = v?.slice(0, -1);
				return [k.trim(), v?.trim()];
			});

		return {
			fname: t.fName.trim(),
			params: fixedTuples.reduce((p, [k, v]) => {
				if (k.length === 0) return p;
				if (typeof v === 'undefined' || v === null) return p;
				return { ...p, [k]: v };
			}, {} as { [name: string]: string }),
		};
	});

	const objectToUndef = removedExtraQuotes.map((f) =>
		Object.keys(f.params).length === 0 ? { fname: f.fname, params: undefined } : f
	) as { fname: string; params?: { [param: string]: string } }[];
	return objectToUndef;
};

const happyTest = `preview()||addBody(css='a'|root='#main')||rmAds(list='')||addsubs/`;
const percent20Test =
	`preview(show=false)||%20addBody(css%20='a'|%20root='#main')||rmAds(list='')||%20addsubs%20`;
const mean1 = `preview(())|%20addBody(css%20='a',%20root='#main')||rmAds(list='')||%20addsubs%20`;

// console.log(parseFunctions(mean1));
