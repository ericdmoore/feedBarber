/* 

@Research: Does the style system export a sheet or presets?

 */

import { setup as setupExport, tw as TWexport, virtual } from "https://esm.sh/twind@1.0.0-next.38";
// import { virtualSheet } from "https://esm.sh/twind@0.16.17/sheets";

// 
import presetAutoprefix from "https://esm.sh/@twind/preset-autoprefix@1.0.0-next.38"
import presetExt from "https://esm.sh/@twind/preset-ext@1.0.0-next.38"
import presetTailwind from "https://esm.sh/@twind/preset-tailwind@1.0.0-next.38"
import presetTailwindForms from "https://esm.sh/@twind/preset-tailwind-forms@1.0.0-next.38"

export const tw = TWexport
export const setup = setupExport
export const sheet = virtual()
export const twind = setupExport( { presets: [
  presetAutoprefix(), 
  presetTailwind(), 
  presetExt(), 
  presetTailwindForms() 
]},
sheet
)

export default twind