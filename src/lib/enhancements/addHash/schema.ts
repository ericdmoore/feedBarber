// return a JSON.stringify of the JSON Schema

import { jsonSchema as jSchema } from "../../../deps.ts";

export const schema = {
  $id: "fill in",
  type: jSchema.TypeName.String,
};

export default JSON.stringify(schema);
