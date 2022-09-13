import { jsonSchema as jSchema } from "../../deps.ts";

export const setPathSchema = {
  type: "object",
  properties: {
    path: {
      type: jSchema.TypeName.String,
      default: "title",
      nullable: true,
    },
    value: {
      type: jSchema.TypeName.String,
      default: 'json::"Title: Hello World!"',
      pattern: "[json::|\{\{::].+",
      nullable: true,
    },
  },
};
