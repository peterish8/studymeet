import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4f46e5",
          focus: "#4338ca",
          soft: "#e0e7ff",
        },
        canvas: {
          DEFAULT: "#f8f8ff",
          parchment: "#f3f3ff",
          soft: "#ffffff",
        },
        surface: {
          DEFAULT: "#ffffff",
          raised: "#f7f7ff",
          muted: "#f2f1ff",
          dark: "#1d1a2f",
        },
        ink: {
          DEFAULT: "#171524",
          muted: "#5b586d",
          subtle: "#8a87a0",
          dark: {
            primary: "#f5f5ff",
            secondary: "#c8c5da",
            tertiary: "#9f9ab8",
          },
        },
        divider: {
          hairline: "#e5e2f1",
          soft: "#efedfb",
        },
        accent: {
          purple: "#7367f0",
          violet: "#9a6ff2",
          yellow: "#f8c546",
          blue: "#38bdf8",
          green: "#34d399",
          red: "#ef4444",
        },
        orb: {
          mint: "#b6f2de",
          peach: "#f9d4b2",
          lavender: "#d8cbff",
          sky: "#bfe7ff",
          rose: "#f4c6dd",
        },
        // compatibility aliases used across existing components
        tile: {
          1: "#1d1a2f",
          2: "#27223d",
          3: "#302a4b",
        },
        cursor: {
          bg: "#141225",
          surface: "#1d1a2f",
          elevated: "#27223d",
          hover: "#302a4b",
          active: "#3a3259",
          border: "#3b3656",
          "border-hover": "#4a4468",
          divider: "#2b2742",
        },
      },
      fontFamily: {
        display: ["Poppins", "Inter", "system-ui", "-apple-system", "sans-serif"],
        body: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        "hero-display": ["64px", { lineHeight: "1.05", letterSpacing: "-0.04em", fontWeight: "700" }],
        "display-lg": ["42px", { lineHeight: "1.1", letterSpacing: "-0.03em", fontWeight: "700" }],
        "display-md": ["30px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "600" }],
        lead: ["22px", { lineHeight: "1.35", letterSpacing: "-0.01em", fontWeight: "500" }],
        "body-strong": ["16px", { lineHeight: "1.5", letterSpacing: "0", fontWeight: "600" }],
        body: ["15px", { lineHeight: "1.55", letterSpacing: "0", fontWeight: "400" }],
        caption: ["13px", { lineHeight: "1.45", letterSpacing: "0", fontWeight: "400" }],
        "caption-strong": ["13px", { lineHeight: "1.45", letterSpacing: "0", fontWeight: "600" }],
        "fine-print": ["12px", { lineHeight: "1.4", letterSpacing: "0", fontWeight: "400" }],
        "micro-legal": ["11px", { lineHeight: "1.3", letterSpacing: "0", fontWeight: "400" }],
      },
      spacing: {
        xxs: "4px",
        xs: "8px",
        sm: "12px",
        md: "17px",
        lg: "24px",
        xl: "32px",
        xxl: "48px",
        section: "80px",
      },
      borderRadius: {
        xs: "6px",
        sm: "10px",
        md: "14px",
        lg: "20px",
        xl: "24px",
        pill: "9999px",
        full: "50%",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(49, 35, 120, 0.08)",
        card: "0 12px 36px rgba(49, 35, 120, 0.12)",
        product: "0 20px 44px rgba(49, 35, 120, 0.16)",
      },
      backdropBlur: {
        frost: "20px",
      },
      transitionTimingFunction: {
        "apple-ease": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
