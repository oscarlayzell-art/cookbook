import { describe, expect, it } from "vitest";
import { formatDuration, parseRecipe } from "./parse";

const page = (head: string, body = "") => `<html><head>${head}</head><body>${body}</body></html>`;
const ld = (data: unknown) => `<script type="application/ld+json">${JSON.stringify(data)}</script>`;

describe("parseRecipe", () => {
  it("reads a JSON-LD recipe nested in @graph", () => {
    const r = parseRecipe(
      page(
        ld({
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "WebPage", name: "ignored" },
            {
              "@type": ["Recipe"],
              name: "Easy paella &amp; chorizo",
              image: [{ "@type": "ImageObject", url: "https://img/paella.jpg" }],
              recipeYield: ["4", "Serves 4"],
              prepTime: "PT10M",
              cookTime: "PT1H5M",
              recipeIngredient: ["1 tbsp olive oil", "<b>300g</b> paella rice"],
              recipeInstructions: [
                { "@type": "HowToSection", name: "Prep", itemListElement: [{ "@type": "HowToStep", text: "Heat the oil." }] },
                { "@type": "HowToStep", text: "Add the rice." },
              ],
              nutrition: { "@type": "NutritionInformation", calories: "481 kcal", fatContent: "13 g", saltContent: "1.3 g" },
              recipeCategory: "Dinner",
              keywords: "Spanish, rice, Dinner",
            },
          ],
        }),
      ),
    )!;
    expect(r.title).toBe("Easy paella & chorizo");
    expect(r.image_url).toBe("https://img/paella.jpg");
    expect(r.servings).toBe("Serves 4");
    expect(r.prep_time).toBe("10 mins");
    expect(r.cook_time).toBe("1 hr 5 mins");
    expect(r.ingredients).toEqual(["1 tbsp olive oil", "300g paella rice"]);
    expect(r.method).toEqual(["Heat the oil.", "Add the rice."]);
    expect(r.nutrition).toEqual({ Calories: "481 kcal", Fat: "13 g", Salt: "1.3 g" });
    expect(r.tags).toEqual(["dinner", "spanish", "rice"]);
  });

  it("skips broken JSON-LD blocks and splits a single instructions string", () => {
    const r = parseRecipe(
      page(
        `<script type="application/ld+json">{oops</script>` +
          ld({ "@type": "Recipe", name: "Eggs", recipeInstructions: "Crack eggs.\nFry them." }),
      ),
    )!;
    expect(r.method).toEqual(["Crack eggs.", "Fry them."]);
  });

  it("falls back to microdata", () => {
    const r = parseRecipe(
      page(
        "",
        `<div itemscope itemtype="https://schema.org/Recipe">
          <h1 itemprop="name">Gnocchi</h1>
          <span itemprop="recipeYield">2</span>
          <li itemprop="recipeIngredient">500g gnocchi</li>
          <li itemprop="recipeIngredient">2 tbsp pesto</li>
          <ol itemprop="recipeInstructions"><li>Boil.</li><li>Stir in pesto.</li></ol>
          <span itemprop="calories">400 kcal</span>
        </div>`,
      ),
    )!;
    expect(r.title).toBe("Gnocchi");
    expect(r.ingredients).toEqual(["500g gnocchi", "2 tbsp pesto"]);
    expect(r.method).toEqual(["Boil.", "Stir in pesto."]);
    expect(r.nutrition).toEqual({ Calories: "400 kcal" });
  });

  it("falls back to page metadata when there is no recipe data", () => {
    const r = parseRecipe(page(`<meta property="og:title" content="Tofu wraps"><meta property="og:image" content="https://img/t.jpg">`))!;
    expect(r).toMatchObject({ title: "Tofu wraps", image_url: "https://img/t.jpg", ingredients: [], method: [] });
  });

  it("returns null for a page with nothing usable", () => {
    expect(parseRecipe("<html></html>")).toBeNull();
  });
});

describe("formatDuration", () => {
  it.each([
    ["PT45M", "45 mins"],
    ["PT1H", "1 hr"],
    ["P1DT2H", "26 hrs"],
    ["PT0M", null],
    ["20 minutes", "20 minutes"],
  ])("%s -> %s", (input, expected) => expect(formatDuration(input)).toBe(expected));
});
