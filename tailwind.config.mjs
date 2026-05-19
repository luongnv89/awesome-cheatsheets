/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Brand palette from public/brand/README.md.
        // Ink = deep green-black used for body text and the back-cards of the
        // brand mark. Amber = primary neon-green brand color (the front card).
        // Coral = the dog-eared corner accent (forest green for contrast).
        // Paper = mint off-white background, used sparingly.
        ink: '#0A1410',
        amber: '#39FF14',
        coral: '#00C853',
        paper: '#F0FFF4',
      },
    },
  },
  plugins: [],
}
