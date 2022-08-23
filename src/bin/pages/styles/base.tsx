/*
@Research: Does the style system export a sheet or presets?
*/

import { virtualSheet } from 'https://esm.sh/twind@0.16.16/sheets';

export { setup, tw } from 'https://esm.sh/twind@0.16.16';
export { getStyleTagProperties, virtualSheet } from 'https://esm.sh/twind@0.16.16/sheets';

//
// import presetAutoprefix from 'https://esm.sh/@twind/preset-autoprefix@1.0.0-next.38';
// import presetExt from 'https://esm.sh/@twind/preset-ext@1.0.0-next.38';
// import presetTailwind from 'https://esm.sh/@twind/preset-tailwind@1.0.0-next.38';
// import presetTailwindForms from 'https://esm.sh/@twind/preset-tailwind-forms@1.0.0-next.38';

export const theme = {
	fontFamily: {
		sans: ['Verdana', 'sans-serif'],
		serif: ['Garamond', 'serif'],
	},
};

export const sheet = virtualSheet();
export default { theme, sheet };
