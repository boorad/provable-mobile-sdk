import { useTheme } from "@/contexts/ThemeContext";
import { type ColorScheme, darkColors, lightColors } from "@/styles/colors";

export const useThemeColors = (): ColorScheme => {
  const { isDark } = useTheme();
  return isDark ? darkColors : lightColors;
};
