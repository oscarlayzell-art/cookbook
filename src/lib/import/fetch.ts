import { parseRecipe, type ImportedRecipe } from "./parse";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36";

export class ImportError extends Error {}

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
      headers: { "user-agent": BROWSER_UA, accept: "text/html,application/xhtml+xml" },
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
  } catch {
    throw new ImportError("We couldn't reach that page. Check the link and try again.");
  }
  if (!res.ok) {
    throw new ImportError(`The recipe site refused the request (error ${res.status}).`);
  }
  const html = await res.text();
  const recipe = parseRecipe(html);
  if (!recipe) throw new ImportError("We couldn't find a recipe on that page.");
  if (recipe.image_url) recipe.image_url = new URL(recipe.image_url, res.url).toString();
  return recipe;
}
