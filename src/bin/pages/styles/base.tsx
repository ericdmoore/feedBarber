/*
@Research: Does the style system export a sheet or presets?
*/

import { sheets, twind } from "../../../deps.ts";
export const { virtualSheet } = sheets;
export const { setup, tw } = twind;

export const theme = {
  fontFamily: {
    sans: ["Verdana", "sans-serif"],
    serif: ["Garamond", "serif"],
  },
};

export const sheet = virtualSheet();
export default { theme, sheet };
