export interface ColorScheme {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  gray: string;
  darkgray: string;
  white: string;
  green: string;
  red: string;
  blue: string;
  tabBarBackground: string;
  tabBarInactive: string;
  tabBarActive: string;
}

export const lightColors: ColorScheme = {
  background: '#ffffff',
  surface: '#f5f5f5',
  text: '#000000',
  textSecondary: '#666666',
  border: '#e0e0e0',
  gray: '#ccc',
  darkgray: '#666',
  white: '#fff',
  green: '#3cb043',
  red: '#e60000',
  blue: '#1976d2',
  tabBarBackground: '#ffffff',
  tabBarInactive: '#666666',
  tabBarActive: '#1976d2',
};

export const darkColors: ColorScheme = {
  background: '#121212',
  surface: '#1e1e1e',
  text: '#ffffff',
  textSecondary: '#b3b3b3',
  border: '#333333',
  gray: '#666',
  darkgray: '#999',
  white: '#fff',
  green: '#4caf50',
  red: '#f44336',
  blue: '#2196f3',
  tabBarBackground: '#1e1e1e',
  tabBarInactive: '#888888',
  tabBarActive: '#2196f3',
};

// Legacy colors for backward compatibility
export const colors: Record<string, string> = {
  gray: '#ccc',
  darkgray: '#666',
  white: '#fff',
  green: '#3cb043',
  red: '#e60000',
  blue: '#1976d2',
};
