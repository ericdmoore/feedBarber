import { minhash as mh } from '../../mod.ts';

export const compareDocSimilarity = async (
	docA: string,
	docB: string,
	tokenizer: (d: string) => string[] = (d) => d.split(' '),
) => {
	const d1 = new mh.Minhash();
	const d2 = new mh.Minhash();

	tokenizer(docA).forEach((t) => d1.update(t));
	tokenizer(docB).forEach((t) => d2.update(t));

	return await { score: d1.jaccard(d2), d1, d2 };
};

const d1 = 'minhash is a probabilistic data structure for estimating the similarity between datasets';
const d2 = 'minhash is a probability data structure for estimating the similarity between documents';
(async () => {
	console.log(d1);
	console.log(d2);
	console.log(await compareDocSimilarity(d1, d2));
})();
