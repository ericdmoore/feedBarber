// define the expected atom shape
// perform the fetch
// validate the response

import { superstruct } from "../../mod.ts";
import { maybe } from "./helpers/maybe.ts";

// define, union
const { is, number, object, string, array } = superstruct;

const AtomResponseKind = object({
  id: number(),
  title: string(),
  tags: maybe(array(string())),
  author: object({
    id: number(),
  }),
});

export const AtomResponse = {
  kind: AtomResponseKind,
  is: (input: unknown) => is(input, AtomResponseKind),
};
