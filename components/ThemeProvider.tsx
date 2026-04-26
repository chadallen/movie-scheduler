'use client';

import { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'cinema' | 'wireframe';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'cinema',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('cinema');

  useEffect(() => {
    if (theme === 'wireframe') {
      document.documentElement.classList.add('theme-wireframe');
    } else {
      document.documentElement.classList.remove('theme-wireframe');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
