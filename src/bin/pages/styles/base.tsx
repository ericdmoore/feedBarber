/* 

@Research: Does the style system export a sheet or presets?

 */

import { setup,   } from "https://esm.sh/twind@0.16.16";
import { virtualSheet } from "https://esm.sh/twind@0.16.16/sheets";

const sheet = virtualSheet();

setup({
  theme: {
    fontFamily: {
      sans: ["Helvetica", "sans-serif"],
      serif: ["Times", "serif"],
    },
  },
  sheet,
});

export default sheet