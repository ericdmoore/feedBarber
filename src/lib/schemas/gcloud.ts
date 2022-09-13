import { jsonSchema as jSchema } from "../../mod.ts";

export const pollySchema = {
  $schema: jSchema.$schema,
  $id: "https://feeds.city/schemas/gcloud.polly.json",
  type: jSchema.TypeName.Object,
  required: ["key", "secret"],
  properties: {
    key: jSchema.TypeName.String,
    secret: jSchema.TypeName.String,
    region: jSchema.TypeName.String,
  },
} as jSchema.JSONSchema;

export default JSON.stringify(pollySchema);
