/**
 * @overview
 *  Echo back the params that were parsed
 *  Prefill a form with the data passed in
 *  Add values for other form eleents such  that they are filled in with the default
 *
 * @param show
 * @param payload
 */

export const preview = async (
  show: PromiseLike<boolean>,
  payload?: string,
): Promise<Response> => {
  if (await show) {
    return new Response(``, { headers: { "content-type": "text/html" } });
  } else {
    return new Response(payload, {
      headers: { "content-type": "application/json" },
    });
  }
};
