import { superstruct as s } from '../mod.ts';
const { object, array, string } = s;

export const flags = {
	_alias: {
		outputFmt: 'f',
		url: 'u',
		help: 'h',
		composition: 'c',
		dryrun: 'd',
		verbose: 'v',
	},
	help: {
		flag: '-h --help',
		start: false,
		msg: `
        # Feed Barber

        Feed Barber is a subscription feed proxy that can perform logic on the 
        feed so that the reader can thoroughy enjoy their reading experience
		
		--url       -u 		*                   the URL to the subscribale resource > ATOM | RSS | JSONFEED | SITEMAP
		--comp      -c 		default: preview()  a composition of middleware/transform functions that all chain together
		--outoutFmt -o 		default: jsonfeed   the type of output requested > ATOM | RSS | JSONFEED
		--verbose 	-v 		default: true     	the type of output requested > ATOM | RSS | JSONFEED
		--dryrun 	-d 		default: false     	the type of output requested > ATOM | RSS | JSONFEED
        
        Examples:

        1. Take all defaults - just URL
        - deno run --allow-net src/bin/cli.ts -u https://example.com/atom.xml 

        2. URL + OutoutFmt
        - deno run --allow-net src/bin/cli.ts -f jsonfeed -u https://example.com/atom.xml

        3. Full Monty
        - deno run --allow-net src/bin/cli.ts \\
        -f atom \\
        -c "addBody(css='a'|root='#main')||rmAds(list='')||addsubs||annotateSEO" \\
        -u https://example.com/atom.xml `,
	},
	outputFmt: {
		start: 'atom',
		flag: '-o --outputFmt',
		msg: `
        ## Output Format:
        
        valid values; atom | rss | jsonfeed `,
		validation: (s: string) => {
			return ['atom', 'rss', 'jsonfeed'].includes(s.toLowerCase());
		},
	},
	dryrun: {
		start: false,
		flag: '-d --dryrun',
		msg: `
        ## Dry Run:
        
        Dryrun only parses the input params and acts as a "show plan" for the inptus
        It does not execute the composition pipeline`,
		validation: () => {
			return true;
		},
	},
	verbose: {
		start: true,
		flag: '-v --verbose',
		msg: `## Verbose

		To show more info `
	},
	composition: {
		start: 'preview()',
		flag: '-c --comp',
		msg: `
        ## Compositions

        || separates named functions with params in ()
        |  separates arguments within the params of a function
        =  separates the name and the value of an argument

        example > "function1()||function2(p1='1'|p2='22')"`,
		validation: (s: string) => {
			return typeof s === 'string';
		},
	},
	url: {
		start: null,
		flag: '-u --url',
		msg: `
        ## URL

        the URL of the subscribale feed

        example> http://somedomain.com/atom.xml`,
		validation: (s: string) => {
			try {
				new URL(s);
				return true;
			} catch (_) {
				return false;
			}
		},
	},
};
export default flags;
