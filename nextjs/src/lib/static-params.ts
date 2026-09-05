/**
 * The placeholder Cache Components requires from an empty `generateStaticParams`.
 *
 * Cache Components refuses to build a dynamic route whose `generateStaticParams` returns an
 * empty array. The reason is sound: it prerenders one path to prove the route does not reach
 * for `cookies()`, `headers()` or `searchParams` outside a dynamic boundary, and with nothing
 * to prerender it cannot make that check.
 *
 * This site starts with an empty database, on purpose. Blog posts, portfolio projects and the
 * tags derived from them are entered through the admin, so every one of those routes returns
 * an empty list on the first build and on any deployment made before the content is in. That
 * is the intended state rather than a mistake, and it must not fail a build.
 *
 * So when the real list is empty, one placeholder is returned instead. It is the answer the
 * Next.js documentation gives for exactly this case. The value cannot collide with a real
 * slug, because slugs are produced by `slugify` and cannot contain underscores, and every
 * page that receives it looks the record up, finds nothing and calls `notFound()`. The
 * prerendered result is therefore a 404 page, which is the correct response for that URL and
 * is what a visitor typing it would get anyway.
 *
 * The cost is that build-time validation runs against a path that 404s early, so it proves
 * less than it would against a real record. Once there is content, the placeholder disappears
 * and the check is the real one again.
 */

export const STATIC_PARAM_PLACEHOLDER = "__none__";

/**
 * The params, or one placeholder if there are none.
 *
 * ```ts
 * export async function generateStaticParams() {
 *   return withPlaceholder(await getPublishedPostSlugs(), "slug");
 * }
 * ```
 */
export function withPlaceholder<K extends string>(
  values: readonly string[],
  key: K,
): Record<K, string>[] {
  const source = values.length > 0 ? values : [STATIC_PARAM_PLACEHOLDER];

  return source.map((value) => ({ [key]: value }) as Record<K, string>);
}
