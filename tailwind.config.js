module.exports = {
  content: ["./src/**/*.{html,js}"],
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
  theme: {
    extend: {
      screens: {
        short: { raw: "(max-height: 720px)" },
      },
    },
  },
};
