export const Colors = {
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

    // Brand colors
    primary: "#2D6A4F",
    accent: "#52B788",
    accentText: "#1B4332",
    highlight: "#D4A373",
    purple: "#7B68AE",
    danger: "#E63946",

    // Tab bar
    tabBarBackground: "#FFFFFF",
    tabBarBorder: "rgba(0, 0, 0, 0.08)",
    tabIconActive: "#2D6A4F",
    tabIconInactive: "#8E8E93",
    tabIconActiveBg: "rgba(45, 106, 79, 0.12)",

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

    // Brand colors
    primary: "#74C69D",
    accent: "#95D5B2",
    accentText: "#B7E4C7",
    highlight: "#DDB892",
    purple: "#A594C9",
    danger: "#FF6B6B",

    // Tab bar
    tabBarBackground: "#1A1A1F",
    tabBarBorder: "rgba(255, 255, 255, 0.08)",
    tabIconActive: "#74C69D",
    tabIconInactive: "#6B6B70",
    tabIconActiveBg: "rgba(116, 198, 157, 0.15)",

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

export type ColorScheme = keyof typeof Colors;
export type ColorTokens = {
  [K in keyof typeof Colors.light]: string;
};
export type ColorKey = keyof ColorTokens;
