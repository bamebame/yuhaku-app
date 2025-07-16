import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // POSシステム用カスタムカラー - 新カラースキーム
        pos: {
          border: "#1c1c1c", // 黒枠線
          background: "#fafafa", // 薄いグレー背景
          foreground: "#1c1c1c", // 黒文字
          muted: "#666666", // グレー補助テキスト
          accent: "#133b6b", // ディープブルーアクセント（アクティブ要素）
          light: "#f5f5f5", // ライトグレー
          hover: "#eeeeee", // ホバー時のグレー
          primary: "#133b6b", // メインディープブルー（ボタン・アクティブ要素）
          "primary-light": "#1d4ed8", // 明るいディープブルー
          "primary-dark": "#0f2a4a", // 暗いディープブルー
        },
      },
      borderWidth: {
        "3": "3px",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // POSシステム用（シャープな角）
        pos: "0px",
      },
      fontSize: {
        // POSシステム用サイズ
        "pos-xl": ["1.25rem", { lineHeight: "1.2" }],
        "pos-lg": ["1.125rem", { lineHeight: "1.3" }],
        "pos-base": ["1rem", { lineHeight: "1.4" }],
        "pos-sm": ["0.875rem", { lineHeight: "1.4" }],
        "pos-xs": ["0.75rem", { lineHeight: "1.4" }],
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config