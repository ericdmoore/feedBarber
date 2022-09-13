/** @jsx h */
/** @jsxFrag Fragment */

import { Fragment, h, jsx, sift } from "../../mod.ts";
type Handler = sift.Handler;

// pick out the user token
// look up the compositions saved by the user
// display the list to the screen as preview links

export const ListFeedsForUser: Handler = (req, pathParam) => {
  return jsx(
    <>
      <h1>User</h1>

      <h3 style="margin: 1em 0 0 0;">Feeds</h3>
      <p>show a list of feeds...</p>

      <h3 style="margin: 1em 0 0 0;">Functions</h3>
      <p>show a list of feeds...</p>

      <p>Users can of course</p>
      <ul>
        <li>Setup Funco Trains</li>
        <li>Send the Funco Trains to a Feed</li>
        <li>Buy Funcos</li>
        <li>Alias Funcos with Params</li>
        <li>Import Funcos and Alias Them</li>
        <li>...and re-alias them with params</li>
      </ul>
    </>,
  );
};

export default ListFeedsForUser;
