/**
 * PostCSS pipeline for the site stylesheets.
 *
 * Replaces the CSS wiring `@astrojs/tailwind` used to inject into Vite
 * (tailwindcss against `tailwind.config.mjs` + autoprefixer). The deprecated
 * integration is peer-capped at Astro 5; this is the documented Tailwind 3
 * setup under Astro ≥ 6 / Vite. Tailwind 4 (via `@tailwindcss/vite`) is
 * tracked separately.
 */
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
