export const json = (i: Response | unknown) => {
  if (i instanceof Response) {
    return new Response(i.body, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } else {
    const resp = JSON.stringify(i, null, 2);
    return new Response(resp, {
      headers: {
        "Content-Type": "application/json",
        "Content-Length": resp.length.toString(),
      },
    });
  }
};
export default json;
