import { type Config } from "tailwindcss";

export const extendedTheme = {
  colors: {
    border: "hsl(var(--border))",
    input: {
      DEFAULT: "hsl(var(--input))",
      invalid: "hsl(var(--input-invalid))",
    },
    ring: {
      DEFAULT: "hsl(var(--ring))",
      invalid: "hsl(var(--foreground-destructive))",
    },
    background: "hsl(var(--background))",
    foreground: {
      DEFAULT: "hsl(var(--foreground))",
      destructive: "hsl(var(--foreground-destructive))",
    },
    primary: {
      DEFAULT: "hsl(var(--primary))",
      foreground: "hsl(var(--primary-foreground))",
    },
    secondary: {
      DEFAULT: "hsl(var(--secondary))",
      foreground: "hsl(var(--secondary-foreground))",
    },
    destructive: {
      DEFAULT: "hsl(var(--destructive))",
      foreground: "hsl(var(--destructive-foreground))",
    },
    muted: {
      DEFAULT: "hsl(var(--muted))",
      foreground: "hsl(var(--muted-foreground))",
    },
    accent: {
      DEFAULT: "hsl(var(--accent))",
      foreground: "hsl(var(--accent-foreground))",
    },
    popover: {
      DEFAULT: "hsl(var(--popover))",
      foreground: "hsl(var(--popover-foreground))",
    },
    card: {
      DEFAULT: "hsl(var(--card))",
      foreground: "hsl(var(--card-foreground))",
    },
  },
  borderColor: {
    DEFAULT: "hsl(var(--border))",
  },
  borderRadius: {
    lg: "var(--radius)",
    md: "calc(var(--radius) - 2px)",
    sm: "calc(var(--radius) - 4px)",
  },
  fontSize: {
    // 1rem = 16px
    /** 80px size / 84px high / bold */
    mega: ["5rem", { lineHeight: "5.25rem", fontWeight: "700" }],
    /** 56px size / 62px high / bold */
    h1: ["3.5rem", { lineHeight: "3.875rem", fontWeight: "700" }],
    /** 40px size / 48px high / bold */
    h2: ["2.5rem", { lineHeight: "3rem", fontWeight: "700" }],
    /** 32px size / 36px high / bold */
    h3: ["2rem", { lineHeight: "2.25rem", fontWeight: "700" }],
    /** 28px size / 36px high / bold */
    h4: ["1.75rem", { lineHeight: "2.25rem", fontWeight: "700" }],
    /** 24px size / 32px high / bold */
    h5: ["1.5rem", { lineHeight: "2rem", fontWeight: "700" }],
    /** 16px size / 20px high / bold */
    h6: ["1rem", { lineHeight: "1.25rem", fontWeight: "700" }],

    /** 32px size / 36px high / normal */
    "body-2xl": ["2rem", { lineHeight: "2.25rem" }],
    /** 28px size / 36px high / normal */
    "body-xl": ["1.75rem", { lineHeight: "2.25rem" }],
    /** 24px size / 32px high / normal */
    "body-lg": ["1.5rem", { lineHeight: "2rem" }],
    /** 20px size / 28px high / normal */
    "body-md": ["1.25rem", { lineHeight: "1.75rem" }],
    /** 16px size / 20px high / normal */
    "body-sm": ["1rem", { lineHeight: "1.25rem" }],
    /** 14px size / 18px high / normal */
    "body-xs": ["0.875rem", { lineHeight: "1.125rem" }],
    /** 12px size / 16px high / normal */
    "body-2xs": ["0.75rem", { lineHeight: "1rem" }],

    /** 18px size / 24px high / semibold */
    caption: ["1.125rem", { lineHeight: "1.5rem", fontWeight: "600" }],
    /** 12px size / 16px high / bold */
    button: ["0.75rem", { lineHeight: "1rem", fontWeight: "700" }],
  },
  screens: {
    xs: "420px",
  },
  animationDuration: {
    active: "2000ms !important",
    hover: "5000ms !important",
    default: "10000ms !important",
  },
  keyframes: {
    "reveal-up": {
      from: { transform: "translateY(20px)", opacity: "0" },
      to: { transform: "translateY(0px)", opacity: "1" },
    },
    "bounce-down": {
      "0%, 100%": { transform: "translateY(0)" },
      "50%": { transform: "translateY(25%)" },
    },
    slidein: {
      from: {
        opacity: "0",
        transform: "translateY(-10px)",
      },
      to: {
        opacity: "1",
        transform: "translateY(0)",
      },
    },
  },
  transitionTimingFunction: {
    "in-quad": "cubic-bezier(0.55, 0.085, 0.68, 0.53)",
    "in-cubic": "cubic-bezier(0.55, 0.055, 0.675, 0.19)",
    "in-quart": "cubic-bezier(0.895, 0.03, 0.685, 0.22)",
    "in-quint": "cubic-bezier(0.755, 0.05, 0.855, 0.06)",
    "in-expo": "cubic-bezier(0.95, 0.05, 0.795, 0.035)",
    "in-circ": "cubic-bezier(0.6, 0.04, 0.98, 0.335)",
    "out-quad": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    "out-cubic": "cubic-bezier(0.215, 0.61, 0.355, 1)",
    "out-quart": "cubic-bezier(0.165, 0.84, 0.44, 1)",
    "out-quint": "cubic-bezier(0.23, 1, 0.32, 1)",
    "out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
    "out-circ": "cubic-bezier(0.075, 0.82, 0.165, 1)",
    "in-out-quad": "cubic-bezier(0.455, 0.03, 0.515, 0.955)",
    "in-out-cubic": "cubic-bezier(0.645, 0.045, 0.355, 1)",
    "in-out-quart": "cubic-bezier(0.77, 0, 0.175, 1)",
    "in-out-quint": "cubic-bezier(0.86, 0, 0.07, 1)",
    "in-out-expo": "cubic-bezier(1, 0, 0, 1)",
    "in-out-circ": "cubic-bezier(0.785, 0.135, 0.15, 0.86)",
  },
  animation: {
    "reveal-up": "reveal-up 0.4s ease-in-out",
    "bounce-down": "bounce-down 0.4s var(--ease-in-out-quad)",
    slidein:
      "slidein 0.4s var(--ease-in-out-quad) var(--slidein-delay, 0) forwards",
  },
} satisfies Config["theme"];
