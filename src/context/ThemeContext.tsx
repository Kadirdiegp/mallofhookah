import { createContext, useContext } from 'react';

// Definiere den Typ für den Theme-Kontext
export type ThemeContextType = {
  darkMode: boolean;
};

// Erstelle den Theme-Kontext
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Hook für den Zugriff auf den Theme-Kontext
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
