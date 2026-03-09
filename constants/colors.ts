export const BaseColors = {
  light: {
    // Backgrounds
    background: "#F2F2F7",
    backgroundSecondary: "#FFFFFF",

    // Glass morphism
    glassBg: "rgba(255, 255, 255, 0.8)",
    glassBorder: "rgba(0, 0, 0, 0.06)",

    // Text
    textPrimary: "#1C1C1E",
    textSecondary: "#8E8E93",
    textTertiary: "#C7C7CC",

    // Brand colors (defaults, overridden by accent theme)
    primary: "#1B4332",
    accent: "#40916C",
    accentText: "#1B4332",
    highlight: "#D4A373",
    purple: "#7B68AE",
    danger: "#E63946",

    // Tab bar
    tabBarBackground: "#FFFFFF",
    tabBarBorder: "rgba(0, 0, 0, 0.08)",
    tabIconActive: "#1B4332",
    tabIconInactive: "#8E8E93",
    tabIconActiveBg: "rgba(27, 67, 50, 0.12)",

    // Cards & surfaces
    cardBackground: "#FFFFFF",
    cardBorder: "rgba(0, 0, 0, 0.06)",
    surfaceRaised: "#FFFFFF",

    // Progress
    progressTrack: "rgba(0, 0, 0, 0.1)",

    // Premium/Gold
    gold: "#FFD700",
    goldLight: "#FDB931",
    goldDark: "#996515",

    // Overlays
    overlayBackground: "rgba(0, 0, 0, 0.5)",
  },
  dark: {
    // Backgrounds
    background: "#050505",
    backgroundSecondary: "#1C1C1E",

    // Glass morphism
    glassBg: "rgba(255, 255, 255, 0.08)",
    glassBorder: "rgba(255, 255, 255, 0.1)",

    // Text
    textPrimary: "#FFFFFF",
    textSecondary: "#A1A1AA",
    textTertiary: "#6B6B70",

    // Brand colors (defaults, overridden by accent theme)
    primary: "#52B788",
    accent: "#74C69D",
    accentText: "#B7E4C7",
    highlight: "#DDB892",
    purple: "#A594C9",
    danger: "#FF6B6B",

    // Tab bar
    tabBarBackground: "#1A1A1F",
    tabBarBorder: "rgba(255, 255, 255, 0.08)",
    tabIconActive: "#52B788",
    tabIconInactive: "#6B6B70",
    tabIconActiveBg: "rgba(82, 183, 136, 0.15)",

    // Cards & surfaces
    cardBackground: "rgba(255, 255, 255, 0.08)",
    cardBorder: "rgba(255, 255, 255, 0.1)",
    surfaceRaised: "#1C1C1E",

    // Progress
    progressTrack: "rgba(255, 255, 255, 0.1)",

    // Premium/Gold
    gold: "#FFD700",
    goldLight: "#FDB931",
    goldDark: "#996515",

    // Overlays
    overlayBackground: "rgba(0, 0, 0, 0.75)",
  },
} as const;

// Accent theme overrides for brand colors
export type AccentThemeId = "forest" | "ocean" | "berry" | "sunset" | "slate";

interface AccentThemeConfig {
  id: AccentThemeId;
  label: string;
  preview: string; // Color shown in the picker circle
  light: {
    primary: string;
    accent: string;
    accentText: string;
    tabIconActive: string;
    tabIconActiveBg: string;
  };
  dark: {
    primary: string;
    accent: string;
    accentText: string;
    tabIconActive: string;
    tabIconActiveBg: string;
  };
  gradients: {
    light: { primary: readonly string[]; accent: readonly string[] };
    dark: { primary: readonly string[]; accent: readonly string[] };
  };
}

export const ACCENT_THEMES: Record<AccentThemeId, AccentThemeConfig> = {
  forest: {
    id: "forest",
    label: "Forest",
    preview: "#2D6A4F",
    light: {
      primary: "#1B4332",
      accent: "#40916C",
      accentText: "#1B4332",
      tabIconActive: "#1B4332",
      tabIconActiveBg: "rgba(27, 67, 50, 0.12)",
    },
    dark: {
      primary: "#52B788",
      accent: "#74C69D",
      accentText: "#B7E4C7",
      tabIconActive: "#52B788",
      tabIconActiveBg: "rgba(82, 183, 136, 0.15)",
    },
    gradients: {
      light: { primary: ["#1B4332", "#143728"], accent: ["#40916C", "#2D6A4F"] },
      dark: { primary: ["#52B788", "#40916C"], accent: ["#74C69D", "#52B788"] },
    },
  },
  ocean: {
    id: "ocean",
    label: "Ocean",
    preview: "#2563EB",
    light: {
      primary: "#1E40AF",
      accent: "#3B82F6",
      accentText: "#1E3A5F",
      tabIconActive: "#1E40AF",
      tabIconActiveBg: "rgba(30, 64, 175, 0.12)",
    },
    dark: {
      primary: "#60A5FA",
      accent: "#93C5FD",
      accentText: "#BFDBFE",
      tabIconActive: "#60A5FA",
      tabIconActiveBg: "rgba(96, 165, 250, 0.15)",
    },
    gradients: {
      light: { primary: ["#1E40AF", "#1E3A8A"], accent: ["#3B82F6", "#2563EB"] },
      dark: { primary: ["#60A5FA", "#3B82F6"], accent: ["#93C5FD", "#60A5FA"] },
    },
  },
  berry: {
    id: "berry",
    label: "Berry",
    preview: "#7C3AED",
    light: {
      primary: "#6D28D9",
      accent: "#8B5CF6",
      accentText: "#4C1D95",
      tabIconActive: "#6D28D9",
      tabIconActiveBg: "rgba(109, 40, 217, 0.12)",
    },
    dark: {
      primary: "#A78BFA",
      accent: "#C4B5FD",
      accentText: "#DDD6FE",
      tabIconActive: "#A78BFA",
      tabIconActiveBg: "rgba(167, 139, 250, 0.15)",
    },
    gradients: {
      light: { primary: ["#6D28D9", "#5B21B6"], accent: ["#8B5CF6", "#7C3AED"] },
      dark: { primary: ["#A78BFA", "#8B5CF6"], accent: ["#C4B5FD", "#A78BFA"] },
    },
  },
  sunset: {
    id: "sunset",
    label: "Sunset",
    preview: "#EA580C",
    light: {
      primary: "#C2410C",
      accent: "#EA580C",
      accentText: "#7C2D12",
      tabIconActive: "#C2410C",
      tabIconActiveBg: "rgba(194, 65, 12, 0.12)",
    },
    dark: {
      primary: "#FB923C",
      accent: "#FDBA74",
      accentText: "#FED7AA",
      tabIconActive: "#FB923C",
      tabIconActiveBg: "rgba(251, 146, 60, 0.15)",
    },
    gradients: {
      light: { primary: ["#C2410C", "#9A3412"], accent: ["#EA580C", "#C2410C"] },
      dark: { primary: ["#FB923C", "#F97316"], accent: ["#FDBA74", "#FB923C"] },
    },
  },
  slate: {
    id: "slate",
    label: "Slate",
    preview: "#0D9488",
    light: {
      primary: "#0F766E",
      accent: "#14B8A6",
      accentText: "#134E4A",
      tabIconActive: "#0F766E",
      tabIconActiveBg: "rgba(15, 118, 110, 0.12)",
    },
    dark: {
      primary: "#2DD4BF",
      accent: "#5EEAD4",
      accentText: "#99F6E4",
      tabIconActive: "#2DD4BF",
      tabIconActiveBg: "rgba(45, 212, 191, 0.15)",
    },
    gradients: {
      light: { primary: ["#0F766E", "#115E59"], accent: ["#14B8A6", "#0D9488"] },
      dark: { primary: ["#2DD4BF", "#14B8A6"], accent: ["#5EEAD4", "#2DD4BF"] },
    },
  },
};

export const ACCENT_THEME_LIST = Object.values(ACCENT_THEMES);

// Build colors by merging base + accent theme overrides
export function buildColors(
  scheme: ColorScheme,
  accentTheme: AccentThemeId
): ColorTokens {
  const base = BaseColors[scheme];
  const overrides = ACCENT_THEMES[accentTheme][scheme];
  return { ...base, ...overrides };
}

// Legacy export for compatibility - uses forest default
export const Colors = {
  light: BaseColors.light,
  dark: BaseColors.dark,
} as const;

export type ColorScheme = "light" | "dark";
export type ColorTokens = {
  [K in keyof typeof BaseColors.light]: string;
};
export type ColorKey = keyof ColorTokens;
