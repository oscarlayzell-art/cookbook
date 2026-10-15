import * as cheerio from "cheerio";

export type ImportedRecipe = {
  title: string;
  description: string | null;
  image_url: string | null;
  servings: string | null;
  prep_time: string | null;
  cook_time: string | null;
  total_time: string | null;
  ingredients: string[];
  method: string[];
  nutrition: Record<string, string>;
  tags: string[];
  source_data: unknown;
};

type Json = Record<string, unknown>;

const NUTRITION_LABELS: Record<string, string> = {
  calories: "Calories",
  fatContent: "Fat",
  saturatedFatContent: "Saturated fat",
  transFatContent: "Trans fat",
  unsaturatedFatContent: "Unsaturated fat",
  carbohydrateContent: "Carbohydrates",
  sugarContent: "Sugars",
  fiberContent: "Fibre",
  proteinContent: "Protein",
  sodiumContent: "Sodium",
  saltContent: "Salt",
  cholesterolContent: "Cholesterol",
  servingSize: "Serving size",
};

/** Pull a recipe out of a page's HTML: schema.org JSON-LD first, then microdata, then page metadata. */
export function parseRecipe(html: string): ImportedRecipe | null {
  const $ = cheerio.load(html);
  return fromJsonLd($) ?? fromMicrodata($) ?? fromMeta($);
}

function fromJsonLd($: cheerio.CheerioAPI): ImportedRecipe | null {
  for (const el of $('script[type="application/ld+json"]').toArray()) {
    let data: unknown;
    try {
      data = JSON.parse($(el).text());
    } catch {
      continue;
    }
    const recipe = findRecipeNode(data);
    if (recipe) return normaliseJsonLd(recipe);
  }
  return null;
}

function findRecipeNode(node: unknown): Json | null {
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findRecipeNode(item);
      if (found) return found;
    }
    return null;
  }
  if (!node || typeof node !== "object") return null;
  const obj = node as Json;
  const type = obj["@type"];
  if (type === "Recipe" || (Array.isArray(type) && type.includes("Recipe"))) return obj;
  if (obj["@graph"]) return findRecipeNode(obj["@graph"]);
  if (obj.mainEntity) return findRecipeNode(obj.mainEntity);
  return null;
}

function normaliseJsonLd(r: Json): ImportedRecipe {
  const nutrition: Record<string, string> = {};
  if (r.nutrition && typeof r.nutrition === "object") {
    for (const [key, value] of Object.entries(r.nutrition as Json)) {
      const label = NUTRITION_LABELS[key];
      const text = toText(value);
      if (label && text) nutrition[label] = text;
    }
  }
  return {
    title: toText(r.name) ?? "Untitled recipe",
    description: toText(r.description),
    image_url: toImage(r.image),
    servings: toYield(r.recipeYield),
    prep_time: formatDuration(toText(r.prepTime)),
    cook_time: formatDuration(toText(r.cookTime)),
    total_time: formatDuration(toText(r.totalTime)),
    ingredients: toList(r.recipeIngredient ?? r.ingredients),
    method: toSteps(r.recipeInstructions),
    nutrition,
    tags: unique([
      ...toKeywords(r.recipeCategory),
      ...toKeywords(r.recipeCuisine),
      ...toKeywords(r.keywords),
    ]),
    source_data: r,
  };
}

function fromMicrodata($: cheerio.CheerioAPI): ImportedRecipe | null {
  const root = $('[itemtype*="schema.org/Recipe"]').first();
  if (!root.length) return null;
  const prop = (name: string) => root.find(`[itemprop="${name}"]`);
  const value = (name: string) => {
    const el = prop(name).first();
    if (!el.length) return null;
    return clean(el.attr("content") ?? el.attr("src") ?? el.text()) || null;
  };
  const nutrition: Record<string, string> = {};
  for (const [key, label] of Object.entries(NUTRITION_LABELS)) {
    const v = value(key);
    if (v) nutrition[label] = v;
  }
  const ingredients = prop("recipeIngredient").add(prop("ingredients")).toArray();
  return {
    title: value("name") ?? "Untitled recipe",
    description: value("description"),
    image_url: value("image"),
    servings: value("recipeYield"),
    prep_time: formatDuration(value("prepTime")),
    cook_time: formatDuration(value("cookTime")),
    total_time: formatDuration(value("totalTime")),
    ingredients: ingredients.map((el) => clean($(el).text())).filter(Boolean),
    method: prop("recipeInstructions")
      .toArray()
      .flatMap((el) => {
        const steps = $(el).find("li").toArray();
        return steps.length ? steps.map((s) => clean($(s).text())) : [clean($(el).text())];
      })
      .filter(Boolean),
    nutrition,
    tags: [],
    source_data: null,
  };
}

/** Last resort: the page has no recipe data, so keep the title and photo and let the user fill in the rest. */
function fromMeta($: cheerio.CheerioAPI): ImportedRecipe | null {
  const meta = (name: string) =>
    $(`meta[property="${name}"], meta[name="${name}"]`).first().attr("content")?.trim() || null;
  const title = meta("og:title") ?? (clean($("title").first().text()) || null);
  if (!title) return null;
  return {
    title,
    description: meta("og:description") ?? meta("description"),
    image_url: meta("og:image"),
    servings: null,
    prep_time: null,
    cook_time: null,
    total_time: null,
    ingredients: [],
    method: [],
    nutrition: {},
    tags: [],
    source_data: null,
  };
}

function clean(s: string): string {
  // JSON-LD text often contains HTML tags and entities.
  const text = s.includes("<") || s.includes("&") ? cheerio.load(`<p>${s}</p>`)("p").text() : s;
  return text.replace(/\s+/g, " ").trim();
}

function toText(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "string") return clean(v) || null;
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) return toText(v[0]);
  if (typeof v === "object") {
    const o = v as Json;
    return toText(o.text ?? o.name ?? o["@value"]);
  }
  return null;
}

function toList(v: unknown): string[] {
  if (v == null) return [];
  const arr = Array.isArray(v) ? v : [v];
  return arr.map(toText).filter((s): s is string => !!s);
}

function toSteps(v: unknown): string[] {
  if (v == null) return [];
  if (typeof v === "string") {
    // A single block of text: split on line breaks or list items.
    const parts = v.split(/<\/li>|<br\s*\/?>|\n+/i).map(clean).filter(Boolean);
    return parts.length ? parts : [clean(v)];
  }
  if (Array.isArray(v)) return v.flatMap(toSteps);
  if (typeof v === "object") {
    const o = v as Json;
    if (o.itemListElement) return toSteps(o.itemListElement); // HowToSection
    const text = toText(o.text ?? o.name);
    return text ? [text] : [];
  }
  return [];
}

function toImage(v: unknown): string | null {
  if (!v) return null;
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return toImage(v[0]);
  if (typeof v === "object") return toImage((v as Json).url ?? (v as Json)["@id"]);
  return null;
}

function toYield(v: unknown): string | null {
  const values = toList(v);
  if (!values.length) return null;
  // Sites often give ["4", "4 servings"]; prefer the more descriptive one.
  return values.reduce((a, b) => (b.length > a.length ? b : a));
}

function toKeywords(v: unknown): string[] {
  return toList(v)
    .flatMap((s) => s.split(","))
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function unique(items: string[]): string[] {
  return [...new Set(items)];
}

/** "PT1H30M" -> "1 hr 30 mins"; anything that isn't an ISO 8601 duration is returned as-is. */
export function formatDuration(v: string | null): string | null {
  if (!v) return null;
  const m = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:\d+S)?)?$/i.exec(v.trim());
  if (!m) return v;
  const days = Number(m[1] ?? 0);
  const hours = Number(m[2] ?? 0) + days * 24;
  const mins = Number(m[3] ?? 0);
  const parts = [];
  if (hours) parts.push(`${hours} hr${hours > 1 ? "s" : ""}`);
  if (mins) parts.push(`${mins} min${mins > 1 ? "s" : ""}`);
  return parts.join(" ") || null;
}
