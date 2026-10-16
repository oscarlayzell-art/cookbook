const UNICODE_FRACTIONS: Record<string, number> = {
  "½": 1 / 2, "⅓": 1 / 3, "⅔": 2 / 3, "¼": 1 / 4, "¾": 3 / 4,
  "⅕": 1 / 5, "⅙": 1 / 6, "⅛": 1 / 8, "⅜": 3 / 8, "⅝": 5 / 8, "⅞": 7 / 8,
};
const FRACTION_CHARS = Object.keys(UNICODE_FRACTIONS).join("");

// A quantity: "2", "1.5", "1/2", "1 1/2", "1½", "½", optionally a range like "2-3" or "2 to 3".
const NUMBER = `(?:\\d+(?:[.,]\\d+)?(?:\\s*[${FRACTION_CHARS}]|\\s+\\d+/\\d+|/\\d+)?|[${FRACTION_CHARS}])`;
const QUANTITY = new RegExp(`${NUMBER}(?:\\s*(?:-|–|to)\\s*${NUMBER})?`);

function parseNumber(text: string): number {
  const t = text.trim();
  const mixed = t.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const frac = t.match(/^(\d+)\/(\d+)$/);
  if (frac) return Number(frac[1]) / Number(frac[2]);
  const uni = t.match(new RegExp(`^(\\d*)\\s*([${FRACTION_CHARS}])$`));
  if (uni) return Number(uni[1] || 0) + UNICODE_FRACTIONS[uni[2]];
  return Number(t.replace(",", "."));
}

const NICE_FRACTIONS: [number, string][] = [
  [1 / 8, "⅛"], [1 / 4, "¼"], [1 / 3, "⅓"], [1 / 2, "½"], [2 / 3, "⅔"], [3 / 4, "¾"],
];

/** Write a scaled amount the way a recipe would: "1½", "⅓", "250", "2.5". */
export function formatAmount(n: number): string {
  if (n >= 10) return String(Math.round(n));
  const whole = Math.floor(n);
  const rest = n - whole;
  if (rest < 0.06) return String(whole || n.toFixed(2).replace(/0+$/, ""));
  if (rest > 0.94) return String(whole + 1);
  for (const [value, glyph] of NICE_FRACTIONS) {
    if (Math.abs(rest - value) < 0.04) return `${whole || ""}${glyph}`;
  }
  return String(Math.round(n * 10) / 10);
}

/** The first number in a servings line ("Serves 4-6" → 4), or null when there isn't one. */
export function baseServings(servings: string | null | undefined): number | null {
  const m = String(servings ?? "").match(QUANTITY);
  if (!m) return null;
  const n = parseNumber(m[0].split(/\s*(?:-|–|to)\s*/)[0]);
  return n > 0 ? n : null;
}

/** Multiply the first quantity in a line of text ("200g flour" × 2 → "400g flour"). */
export function scaleText(text: string, factor: number): string {
  if (factor === 1) return text;
  return text.replace(QUANTITY, (match) =>
    match
      .split(/(\s*(?:-|–|to)\s*)/)
      .map((part, i) => (i % 2 ? part : formatAmount(parseNumber(part) * factor)))
      .join(""),
  );
}
