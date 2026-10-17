import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { aiErrorMessage, claudeClient, MODEL } from "@/lib/ai/claude";
import { withAiAllowance } from "@/lib/ai/usage";
import { ImportError } from "./fetch";
import type { ImportedRecipe } from "./parse";

const RecipeSchema = z.object({
  is_recipe: z.boolean().describe("False if the text does not contain a recipe."),
  title: z.string(),
  description: z.string().nullable(),
  servings: z.string().nullable().describe('As written, e.g. "Serves 4".'),
  prep_time: z.string().nullable().describe('Human readable, e.g. "15 mins".'),
  cook_time: z.string().nullable(),
  total_time: z.string().nullable(),
  ingredients: z.array(z.string()).describe("One ingredient per item, with quantities, as written."),
  method: z.array(z.string()).describe("One step per item, in order, without step numbers."),
  nutrition: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .describe('Per-serving nutrition if given, e.g. {label: "Calories", value: "450kcal"}.'),
  tags: z.array(z.string()).describe("A few short lowercase tags such as cuisine, course or main ingredient."),
});

const PROMPT = `Below is text a person copied from a recipe web page. It may include menus, adverts, reviews and other clutter. Pull out the recipe exactly as the page gives it: copy ingredients and steps faithfully, keep the page's units and wording, and do not invent anything that isn't there (use null or an empty list instead).`;

/** Turn text pasted from a recipe page into a recipe, using Claude. */
export async function recipeFromText(pasted: string): Promise<ImportedRecipe> {
  const client = claudeClient();
  if (!client) {
    throw new ImportError("Pasting recipes isn't switched on yet. Ask Oscar to add the AI key.");
  }
  let response;
  try {
    response = await withAiAllowance("paste", () =>
      client.messages.parse({
        model: MODEL,
        max_tokens: 16000,
        messages: [{ role: "user", content: `${PROMPT}\n\n<page_text>\n${pasted}\n</page_text>` }],
        output_config: { format: zodOutputFormat(RecipeSchema) },
      }),
    );
  } catch (e) {
    console.error("AI recipe extraction failed", e);
    throw new ImportError(aiErrorMessage(e));
  }
  const r = response.parsed_output;
  if (response.stop_reason === "refusal" || !r) {
    throw new ImportError("We couldn't read a recipe from that text. Try copying the whole page again.");
  }
  if (!r.is_recipe || r.ingredients.length === 0) {
    throw new ImportError("We couldn't find a recipe in that text. Make sure you copied the whole page.");
  }
  return {
    title: r.title || "Untitled recipe",
    description: r.description,
    image_url: null,
    servings: r.servings,
    prep_time: r.prep_time,
    cook_time: r.cook_time,
    total_time: r.total_time,
    ingredients: r.ingredients,
    method: r.method,
    nutrition: Object.fromEntries(r.nutrition.map((n) => [n.label, n.value])),
    tags: r.tags,
    source_data: { pasted: true },
  };
}
