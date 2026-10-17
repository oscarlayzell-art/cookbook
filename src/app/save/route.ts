/**
 * Where the Save to Cook Book button sends a recipe page.
 *
 * The browser arrives here from the recipe site, so sign-in cookies may not come along
 * (browsers hold them back on posts from other sites). This page therefore doesn't save
 * anything itself: it tucks the recipe into the tab's session storage and moves on to
 * /book/receive, where the person is signed in and confirms the save.
 */
import { RECEIVE_KEY } from "../../lib/import/receive";

const MAX_HTML = 1_000_000;

function page(body: string, status = 200) {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cook Book</title></head><body style="font-family:system-ui,sans-serif;padding:2rem;color:#44403c">${body}</body></html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } },
  );
}

/** JSON that is safe to place inside a <script> tag. */
function scriptJson(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export async function POST(request: Request) {
  let url = "";
  let html = "";
  try {
    const form = await request.formData();
    url = String(form.get("url") ?? "");
    html = String(form.get("html") ?? "").slice(0, MAX_HTML);
  } catch {
    // fall through to the error below
  }
  if (!/^https?:\/\//i.test(url) || !html) {
    return page(`<p>We couldn't read that recipe. Go back and try the Save to Cook Book button again.</p>`, 400);
  }

  const data = scriptJson({ url, html });
  return page(
    `<p>Opening your cookbook…</p><script>try{sessionStorage.setItem(${JSON.stringify(RECEIVE_KEY)},JSON.stringify(${data}))}catch(e){}location.replace("/book/receive")</script>`,
  );
}

export function GET(request: Request) {
  return Response.redirect(new URL("/book", request.url), 303);
}
