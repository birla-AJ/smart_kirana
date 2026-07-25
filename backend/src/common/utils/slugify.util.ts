/**
 * Converts a display name into a URL-safe slug, e.g.
 * "Fruits & Vegetables!" -> "fruits-vegetables".
 * Shared by Category, SubCategory, Brand and Product so slug
 * generation is identical everywhere.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Appends a short random suffix to a slug to resolve a uniqueness
 * collision (e.g. two products both named "Amul Milk").
 */
export function withUniqueSuffix(slug: string): string {
  return `${slug}-${Math.random().toString(36).slice(2, 7)}`;
}
