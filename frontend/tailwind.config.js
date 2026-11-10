/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dbe6fe",
          200: "#bfd2fe",
          300: "#93b3fd",
          400: "#608afa",
          500: "#3b66f5",
          600: "#2547ea",
          700: "#1e37d6",
          800: "#1f30ad",
          900: "#1f2e88",
        },
      },
    },
  },
  plugins: [],
};
