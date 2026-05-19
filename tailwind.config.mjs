/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Brand palette from public/brand/README.md.
        // Ink = deep navy used for body text and the back-cards of the
        // brand mark. Amber = primary brand color (the front card).
        // Coral = the dog-eared corner accent. Paper = warm off-white
        // background, used sparingly to evoke notebook-page warmth.
        ink: '#1B1F3A',
        amber: '#F2B705',
        coral: '#FF6B5C',
        paper: '#FAF7F2',
      },
    },
  },
  plugins: [],
}
