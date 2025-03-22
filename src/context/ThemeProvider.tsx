import React, { ReactNode, useEffect } from 'react';
import { ThemeContext } from './ThemeContext';

interface ThemeProviderProps {
  children: ReactNode;
}

// ThemeProvider-Komponente, die immer den Dark Mode erzwingt
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Immer Dark Mode verwenden
  const darkMode = true;

  // Aktualisiere das HTML-Element, um Dark Mode zu erzwingen
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('dark');
  }, []);

  return (
    <ThemeContext.Provider value={{ darkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
