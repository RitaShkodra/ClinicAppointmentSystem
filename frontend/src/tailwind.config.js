/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        /* ===========================
           BRAND (FROM YOUR PALETTE)
           #daebed #b0d2db #8c9c98 #579ec0 #506063 #232b2a
        ============================ */
        brand: {
          DEFAULT: "#579ec0", // primary
          hover: "#506063",   // deeper hover
          soft: "#daebed",    // pagey soft surface
          tint: "#b0d2db",    // slightly stronger tint
        },

        accent: {
          DEFAULT: "#506063", // secondary (text/cta alternative)
          soft: "#daebed",
        },

        neutralbrand: {
          DEFAULT: "#8c9c98", // muted grey-green
        },

        /* ===========================
           BACKGROUND SYSTEM
        ============================ */
        background: {
          DEFAULT: "#daebed", // page background
          card: "#FFFFFF",    // cards
          subtle: "#b0d2db",  // sections / pills
          border: "#b0d2db",  // visible borders
        },

        /* ===========================
           TEXT SYSTEM
        ============================ */
        textcolor: {
          primary: "#232b2a",
          secondary: "#506063",
          muted: "#8c9c98",
        },

        /* ===========================
           STATUS COLORS (SOFT)
           (kept readable + fits palette vibe)
        ============================ */
        success: {
          DEFAULT: "#2F7A5A",
          soft: "#D9F0E6",
        },
        warning: {
          DEFAULT: "#B66A1E",
          soft: "#FCEFD9",
        },
        danger: {
          DEFAULT: "#B43B3B",
          soft: "#FBE1E1",
        },
      },

      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.5rem",
      },

      boxShadow: {
        soft: "0 4px 20px rgba(35, 43, 42, 0.06)",
        medium: "0 10px 35px rgba(35, 43, 42, 0.10)",
      },
    },
  },
  plugins: [],
};