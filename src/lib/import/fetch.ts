import { parseRecipe, type ImportedRecipe } from "./parse";

// Some recipe sites sit behind bot protection that rejects requests which don't look like a browser.
const BROWSER_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "accept-language": "en-GB,en;q=0.9",
  "cache-control": "no-cache",
  "sec-ch-ua": '"Chromium";v="129", "Not=A?Brand";v="8", "Google Chrome";v="129"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "document",
  "sec-fetch-mode": "navigate",
  "sec-fetch-site": "none",
  "sec-fetch-user": "?1",
  "upgrade-insecure-requests": "1",
};

export const BLOCKED_HINT =
  "Some sites block cookbook apps. Use the Save to Cook Book button from that page instead.";

export class ImportError extends Error {
  constructor(
    message: string,
    /** True when the site itself refused us, so the bookmarklet is the way round it. */
    readonly blocked = false,
  ) {
    super(message);
  }
}

/** Normalise a pasted link, rejecting anything that isn't a public http(s) address. */
export function cleanUrl(input: string): string {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    throw new ImportError("That doesn't look like a web address.");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new ImportError("Only web links (http or https) can be imported.");
  }
  const host = url.hostname;
  if (
    host === "localhost" ||
    !host.includes(".") ||
    /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.)/.test(host) ||
    host.startsWith("[")
  ) {
    throw new ImportError("That address can't be imported.");
  }
  url.hash = "";
  return url.toString();
}

export async function importRecipe(url: string): Promise<ImportedRecipe> {
  let res: Response;
  try {
    res = await fetch(url, {
      headers: BROWSER_HEADERS,
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
  } catch (e) {
    const timedOut = e instanceof Error && e.name === "TimeoutError";
    console.error("Recipe fetch failed", url, e);
    throw new ImportError(
      timedOut
        ? `That site didn't respond in time. ${BLOCKED_HINT}`
        : `We couldn't reach that page. ${BLOCKED_HINT}`,
      true,
    );
  }
  if (!res.ok) {
    console.error("Recipe fetch refused", url, res.status);
    throw new ImportError(`The recipe site refused the request (error ${res.status}). ${BLOCKED_HINT}`, true);
  }
  return recipeFromHtml(await res.text(), res.url);
}

/** Parse a page's HTML into a recipe; used for fetched pages and for pages sent from the bookmarklet. */
export function recipeFromHtml(html: string, pageUrl: string): ImportedRecipe {
  const recipe = parseRecipe(html);
  if (!recipe) throw new ImportError("We couldn't find a recipe on that page.");
  if (recipe.image_url) recipe.image_url = new URL(recipe.image_url, pageUrl).toString();
  return recipe;
}
