/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'selector', // Use class-based dark mode (html.dark)
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './whatsapp/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Use standard Tailwind colors, prefix handles dark mode
      },
    },
  },
  corePlugins: {
    // Disable the prefers-color-scheme media query generation
    // We ONLY want dark mode to work when html.dark class is explicitly added
  },
  plugins: [],
}
