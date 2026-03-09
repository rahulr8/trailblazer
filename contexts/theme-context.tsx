import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useColorScheme as useSystemColorScheme } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  type AccentThemeId,
  type ColorScheme,
  type ColorTokens,
  type GradientTokens,
  type ShadowTokens,
  Shadows,
  buildColors,
  buildGradients,
} from "@/constants";

interface ThemeContextValue {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
  isDark: boolean;
  colors: ColorTokens;
  shadows: ShadowTokens;
  gradients: GradientTokens;
  accentTheme: AccentThemeId;
  setAccentTheme: (theme: AccentThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "@trailblazer_theme";
const ACCENT_STORAGE_KEY = "@trailblazer_accent_theme";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemScheme = useSystemColorScheme();
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>("dark");
  const [accentTheme, setAccentThemeState] = useState<AccentThemeId>("forest");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      try {
        const [savedScheme, savedAccent] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(ACCENT_STORAGE_KEY),
        ]);
        if (savedScheme === "light" || savedScheme === "dark") {
          setColorSchemeState(savedScheme);
        } else if (systemScheme) {
          setColorSchemeState(systemScheme);
        }
        if (savedAccent) {
          setAccentThemeState(savedAccent as AccentThemeId);
        }
      } catch {
        // Use defaults on error
      } finally {
        setIsLoaded(true);
      }
    }
    loadTheme();
  }, [systemScheme]);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    AsyncStorage.setItem(STORAGE_KEY, scheme).catch(() => {});
  }, []);

  const setAccentTheme = useCallback((theme: AccentThemeId) => {
    setAccentThemeState(theme);
    AsyncStorage.setItem(ACCENT_STORAGE_KEY, theme).catch(() => {});
  }, []);

  const toggleColorScheme = useCallback(() => {
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
  }, [colorScheme, setColorScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colorScheme,
      setColorScheme,
      toggleColorScheme,
      isDark: colorScheme === "dark",
      colors: buildColors(colorScheme, accentTheme),
      shadows: Shadows[colorScheme],
      gradients: buildGradients(colorScheme, accentTheme),
      accentTheme,
      setAccentTheme,
    }),
    [colorScheme, setColorScheme, toggleColorScheme, accentTheme, setAccentTheme]
  );

  if (!isLoaded) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
