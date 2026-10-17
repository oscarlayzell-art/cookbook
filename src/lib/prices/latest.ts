/** Items count as the same when their names match, ignoring case and extra spaces. */
export const itemKey = (item: string) => item.trim().replace(/\s+/g, " ").toLowerCase();

/**
 * Ids of rows that have a newer price for the same item.
 * Rows must be ordered newest first.
 */
export function olderDuplicateIds(rows: { id: string; item: string }[]): string[] {
  const seen = new Set<string>();
  const older: string[] = [];
  for (const row of rows) {
    const key = itemKey(row.item);
    if (seen.has(key)) older.push(row.id);
    else seen.add(key);
  }
  return older;
}
