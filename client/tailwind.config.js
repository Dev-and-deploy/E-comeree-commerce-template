/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./templates/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
      },
      fontFamily: {
        sans: ["var(--font-family)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        theme: "var(--border-radius)",
      },
    },
  },
  plugins: [],
};
