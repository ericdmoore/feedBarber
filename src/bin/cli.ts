/**
 * CLI tool for setting up a proxy transform pipeline
 * STDIN is a feed payload
 * -u is a URL
 */

import { green, parse, red, yellow } from '../mod.ts';
import { functions } from '../lib/parsers/enhancementFunctions.ts';
import flags from './cli_flags.ts';

(async () => {
	const sleep = (n: number): Promise<number> =>
		new Promise((res) => {
			setTimeout(() => res(n), n, n);
		});
	const opts = parse(Deno.args);

	if (opts.help || opts.h) {
		console.log(flags.help.msg);
		console.log(flags.outputFmt.msg);
		console.log(flags.url.msg);
		console.log(flags.composition.msg);
	} else {
		let outputStr = '';

		const u = opts.u ?? opts.url ?? flags.url.start;
		const f = opts.f ?? opts.outputFmt ?? flags.outputFmt.start;
		const c = opts.c ?? opts.comp ?? flags.composition.start;
		const dry = opts.d ?? opts.dryrun ?? flags.dryrun.start;
		const v = opts.v ?? opts.verbose ?? flags.verbose.start;

		if (f) {
			if (flags.outputFmt.validation(f)) {
				outputStr += `- ${green('outputFmt:')} ${f}\n`;
			} else {
				outputStr += `- ${red('outputFmt:')} ${f}\n`;
				outputStr += `${red(f)} does not pass the format input validateion\n`;
			}
		}

		if (c.length > 0) {
			if (flags.composition.validation(c)) {
				outputStr += `- ${green('comp.c:')} ${c}\n`;
				outputStr += `- ${green('comp.parsed:')}: ${JSON.stringify(functions.parse()(c), null, 2)}\n`;
			} else {
				outputStr += `${red('PROBLEM--composition:')} ${c}\n`;

				outputStr += `- ${red('comp.c:')} ${c}\n`;
				outputStr += `${red(c)} does not pass the composition input validateion \n`;
			}
		}

		if (v) {
			outputStr += `- ${green('verbose:')} ${v}\n`;
		}

		if (u) {
			if (flags.url.validation(u)) {
				outputStr += `- ${green('url:')} ${u}\n`;
			} else {
				outputStr += `- ${red('url:')} ${u}\n`;
				outputStr += `- ${red(u)}: does not pass the url input validation \n`;
			}
		} else {
			outputStr += `${yellow('url')} is a reqquired field\n`;
		}

		if (dry) {
			outputStr += `- ${green('dryrun:')} ${dry}\n`;
			console.log(outputStr);
		} else if (u) {
			v && console.log(outputStr);
			v && console.log('...starting');
			await sleep(1000);
			v && console.log('processing...');
			await sleep(3000);
			v && console.log('more processing...');
			console.log('<xml><rss><channel><stuff></channel></rss>');
		} else {
			console.log(outputStr);
		}
	}
})();
