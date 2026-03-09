import { type AccentThemeId, type ColorScheme, ACCENT_THEMES } from "./colors";

const diagonal = { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };
const horizontal = { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } };

export interface GradientValue {
  colors: readonly string[];
  start: { x: number; y: number };
  end: { x: number; y: number };
}

const staticGradients = {
  light: {
    ai: {
      colors: ["#7B68AE", "#5A4E8C"] as const,
      ...diagonal,
    },
    gold: {
      colors: ["#D4A373", "#C48B5C", "#A67C52"] as const,
      ...horizontal,
    },
    danger: {
      colors: ["#E63946", "#D62839"] as const,
      ...diagonal,
    },
  },
  dark: {
    ai: {
      colors: ["#A594C9", "#7B68AE"] as const,
      ...diagonal,
    },
    gold: {
      colors: ["#DDB892", "#D4A373", "#C48B5C"] as const,
      ...horizontal,
    },
    danger: {
      colors: ["#FF6B6B", "#FF5252"] as const,
      ...diagonal,
    },
  },
} as const;

export function buildGradients(
  scheme: ColorScheme,
  accentTheme: AccentThemeId
): GradientTokens {
  const theme = ACCENT_THEMES[accentTheme];
  const themeGradients = theme.gradients[scheme];
  return {
    primary: { colors: themeGradients.primary, ...diagonal },
    accent: { colors: themeGradients.accent, ...diagonal },
    ...staticGradients[scheme],
  };
}

// Legacy export for compatibility
export const Gradients = {
  light: {
    primary: { colors: ["#1B4332", "#143728"] as const, ...diagonal },
    accent: { colors: ["#40916C", "#2D6A4F"] as const, ...diagonal },
    ...staticGradients.light,
  },
  dark: {
    primary: { colors: ["#52B788", "#40916C"] as const, ...diagonal },
    accent: { colors: ["#74C69D", "#52B788"] as const, ...diagonal },
    ...staticGradients.dark,
  },
} as const;

export type GradientKey = "primary" | "accent" | "ai" | "gold" | "danger";
export type GradientTokens = {
  [K in GradientKey]: GradientValue;
};
