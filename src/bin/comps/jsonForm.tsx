// deno-lint-ignore-file no-explicit-any
/** @jsx h */
/** @jsxFrag Fragment */

/*

direct type

'null':
    A JSON "null" value
'boolean':
    A "true" or "false" value, from the JSON "true" or "false" value
'number':
    An arbitrary-precision, base-10 decimal number value, from the JSON "number" value
'string':
    A string of Unicode code points, from the JSON "string" value

'object':
    An unordered set of properties mapping a string to an instance, from the JSON "object" value
    a collection or <fieldset> grouping

'array':
    An ordered list of instances, from the JSON "array" value


or [] union type


- $ref
    - internal
        - #/path/0/path
    - extenral
        - http(s)://[URL]
- $dynamicRef
    - not yet supported
- dependencies
    - not yet supported



Title, Description, Property name, User Given Value
-


AnyOf - show a mode picker


'Array of' Pattern
[empty box] [add] // box is governed by the items constraint
// on add - saves entry to the DOM, and adds next empty box

'Array of' AnyOf - Suck
[empty box] [add] // box is governed by the items constraint
// on add - saves entry to the DOM, and adds next empty box




MultiSelect

<label for="cars">Choose a car:</label>
<select name="cars" id="cars" multiple>
    <option value="volvo">Volvo</option>
    <option value="saab">Saab</option>
    <option value="opel">Opel</option>
    <option value="audi">Audi</option>
</select>

*/

import {
  fluentSchema,
  Fragment,
  h,
  jsx,
  S,
  sheets,
  sift,
  twind,
} from "../../deps.ts";
import { moduleMap } from "../../lib/enhancements/index.ts";
import { setPathSchema } from "../../lib/schemas/setPath.ts";

const StringToForm = (
  _schema: null,
  _element: fluentSchema.StringSchema,
  _children: unknown[],
): h.JSX.Element => {
  return (
    <>
      <label for="name">Name (4 to 8 characters):</label>
      <input type="text" id="name" name="name" />
    </>
  );
};

const NumberToForm = (
  _schema: null,
  _element: fluentSchema.NumberSchema,
  _children: unknown[],
): h.JSX.Element => {
  return (
    <>
      <label for="name">Name (4 to 8 characters):</label>
      <input id="number" type="number" value="42" />
    </>
  );
};

const RangeToForm = (
  _schema: null,
  _element: fluentSchema.NumberSchema,
  _children: unknown[],
): h.JSX.Element => {
  return (
    <>
      <label for="name">Name (4 to 8 characters):</label>
      <input id="number" type="number" value="42" />
    </>
  );
};

const BoolToForm = (
  _schema: null,
  _element: fluentSchema.BooleanSchema,
  _children: unknown[],
): h.JSX.Element => {
  return (
    <fieldset>
      <label for="name">Name (4 to 8 characters):</label>
      <input type="checkbox" id="name" name="name" />
    </fieldset>
  );
};

const EmailToForm = (
  _schema: null,
  _element: fluentSchema.StringSchema,
  _children: unknown[],
): h.JSX.Element => {
  return (
    <fieldset>
      <label for="name">Name (4 to 8 characters):</label>
      <input type="checkbox" id="name" name="name" />
    </fieldset>
  );
};

const UrlToForm = (
  _schema: null,
  _element: fluentSchema.StringSchema,
  _children: unknown[],
): h.JSX.Element => {
  return (
    <fieldset>
      <label for="name">Name (4 to 8 characters):</label>
      <input type="checkbox" id="name" name="name" />
    </fieldset>
  );
};

// ?
const SmallEnumToForm = (
  _schema: null,
  _element: fluentSchema.ArraySchema,
  _children: unknown[],
): h.JSX.Element => {
  return (
    <>
      <label for="name">Name (4 to 8 characters):</label>
      <input type="radio" id="name" name="name" />
    </>
  );
};

const LargeEnumToForm = (
  _schema: null,
  _element: null,
  _children: unknown[],
): h.JSX.Element => {
  return (
    <>
      <label for="ice-cream-choice">Choose a flavor:</label>
      <input
        list="ice-cream-flavors"
        id="ice-cream-choice"
        name="ice-cream-choice"
      />

      <datalist id="ice-cream-flavors">
        <option value="Chocolate" />
        <option value="Coconut" />
        <option value="Mint" />
        <option value="Strawberry" />
        <option value="Vanilla" />
      </datalist>
    </>
  );
};

// Date
// Month
// Color
// Email
// Url
// Range - Number with min max
//

const ObjectToForm = (
  _schema: null,
  _element: null,
  _children: unknown[],
): h.JSX.Element => {
  return (
    <fieldset>
    </fieldset>
  );
};

const JsonSchemaToForm = (schema: string | fluentSchema.JSONSchema) => {
  const schemaStr = typeof schema === "string"
    ? schema
    : JSON.stringify(schema.valueOf());
  const schemaObj = JSON.parse(schemaStr);

  const domNodes = (schemaObj: any): h.JSX.Element => {
    return <></>;
  };

  const str = (schemaObj: any): string => {
    return JSON.stringify(schemaObj);
  };

  return { str: str(schemaObj), domNodes: domNodes(schemaObj) };
};

export const JsonForm = (
  schema: string | fluentSchema.JSONSchema,
): h.JSX.Element => {
  const schemaStr = typeof schema === "string"
    ? schema
    : JSON.stringify(schema.valueOf());
  console.log({ schemaStr });

  const schemaObj = JSON.parse(schemaStr);
  console.log(schemaObj);

  // const reducer = (
  //     AccFn: ( Children: () => h.JSX.Element) => h.JSX.Element,
  //     elem: [string, unknown],
  //     i:  number
  // ): (Children: () => h.JSX.Element) => h.JSX.Element => {
  //     return (Children: () => h.JSX.Element ): h.JSX.Element => {
  //         return ( <form> <Children/> </form>)
  //     }
  // }
  // const init = (Children: () => h.JSX.Element ): h.JSX.Element => {
  //     return (<form>
  //         <Children/>
  //     </form>)
  // }

  // const r = Object.entries(schemaObj).reduce( reducer, init)

  return <div></div>;
};
