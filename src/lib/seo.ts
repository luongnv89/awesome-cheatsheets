/**
 * SEO URL helpers — single source of truth for the deployed origin and the
 * base-aware absolute URLs used by canonical links, Open Graph tags, JSON-LD,
 * the sitemap endpoint, and llms.txt.
 *
 * The site deploys to a GitHub Pages project path
 * (`https://luongnv89.github.io/awesome-cheatsheets/`), so every absolute URL
 * must join: origin + `import.meta.env.BASE_URL` + path. `siteBase()` and
 * `absoluteUrl()` accept an explicit `base` parameter so unit tests can cover
 * both the project-path and domain-root deployments without touching Vite's
 * environment.
 */

/** Deployed origin (no base path, no trailing slash). */
export const SITE_ORIGIN = "https://luongnv89.github.io";

/** Site name used in JSON-LD and share-card alt text. */
export const SITE_NAME = "Awesome AI Cheatsheets";

/** Astro base with any trailing slash removed ('' at the domain root). */
export function siteBase(base: string = import.meta.env.BASE_URL): string {
  return base.replace(/\/$/, "");
}

/** Absolute URL for a site path, honoring the configured base. */
export function absoluteUrl(
  path: string,
  base: string = import.meta.env.BASE_URL,
): string {
  const suffix = path === "/" ? "/" : path.startsWith("/") ? path : `/${path}`;
  return `${SITE_ORIGIN}${siteBase(base)}${suffix}`;
}

/**
 * Serialize JSON-LD for inline `<script set:html>` embedding. Escapes `<` so
 * content can never terminate the script tag early (`</script>` becomes
 * `\u003c/script>` inside the JSON string).
 */
export function jsonLdScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
