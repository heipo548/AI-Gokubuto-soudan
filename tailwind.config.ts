import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        secondary: "#065F46",
        accent: "#10B981",
        background: {
          main: "#F8FAFC",
          card: "#FFFFFF",
          section: "#F3F4F6",
        },
        text: {
          primary: "#1F2937",
          secondary: "#6B7280",
          light: "#9CA3AF",
          link: "#3B82F6",
        },
        border: {
          light: "#E5E7EB",
          medium: "#D1D5DB",
        },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "\"Segoe UI\"", "Roboto", "sans-serif"],
      },
      fontSize: {
        'h1': "32px",
        'h2': "24px",
        'h3': "20px",
        'h4': "18px",
        'body-lg': "16px",
        'body-std': "14px",
        'body-sm': "12px",
        'link-std': "14px",
        'link-lg': "16px",
        // It's common to provide font sizes as an array [fontSize, lineHeight]
        // For now, just fontSize is provided as per spec.
        // Weights are typically applied via classes like font-bold, font-semibold etc.
      },
      spacing: {
        'xs': "4px",
        's': "8px",
        'm': "16px",
        'l': "24px",
        'xl': "32px",
        'xxl': "48px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
