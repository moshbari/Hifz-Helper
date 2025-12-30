import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = {
  ocean: {
    name: 'Deep Ocean',
    bg: 'bg-slate-900',
    card: 'bg-slate-800',
    cardHover: 'hover:bg-slate-700',
    primary: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    text: 'text-slate-100',
    textMuted: 'text-slate-400',
    border: 'border-slate-700',
    accent: 'text-blue-400',
    success: 'text-emerald-400',
    error: 'text-red-400',
    isDark: true,
  },
  forest: {
    name: 'Forest',
    bg: 'bg-[#0d1f0d]',
    card: 'bg-[#1a3a1a]',
    cardHover: 'hover:bg-[#254025]',
    primary: 'bg-emerald-600',
    primaryHover: 'hover:bg-emerald-700',
    text: 'text-emerald-50',
    textMuted: 'text-emerald-300/60',
    border: 'border-emerald-800/50',
    accent: 'text-emerald-400',
    success: 'text-emerald-300',
    error: 'text-red-400',
    isDark: true,
  },
  royal: {
    name: 'Royal',
    bg: 'bg-[#1a0a2e]',
    card: 'bg-[#2d1650]',
    cardHover: 'hover:bg-[#3d2060]',
    primary: 'bg-purple-600',
    primaryHover: 'hover:bg-purple-700',
    text: 'text-purple-50',
    textMuted: 'text-purple-300/60',
    border: 'border-purple-800/50',
    accent: 'text-purple-400',
    success: 'text-emerald-400',
    error: 'text-red-400',
    isDark: true,
  },
  sunset: {
    name: 'Sunset',
    bg: 'bg-[#1f1315]',
    card: 'bg-[#2d1f22]',
    cardHover: 'hover:bg-[#3d2932]',
    primary: 'bg-orange-600',
    primaryHover: 'hover:bg-orange-700',
    text: 'text-orange-50',
    textMuted: 'text-orange-200/60',
    border: 'border-orange-900/50',
    accent: 'text-orange-400',
    success: 'text-emerald-400',
    error: 'text-red-400',
    isDark: true,
  },
  midnight: {
    name: 'Midnight',
    bg: 'bg-[#0f0f14]',
    card: 'bg-[#1a1a24]',
    cardHover: 'hover:bg-[#252530]',
    primary: 'bg-indigo-600',
    primaryHover: 'hover:bg-indigo-700',
    text: 'text-slate-100',
    textMuted: 'text-slate-400',
    border: 'border-slate-800',
    accent: 'text-indigo-400',
    success: 'text-emerald-400',
    error: 'text-red-400',
    isDark: true,
  },
  light: {
    name: 'Light',
    bg: 'bg-slate-100',
    card: 'bg-white',
    cardHover: 'hover:bg-slate-50',
    primary: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    text: 'text-slate-900',
    textMuted: 'text-slate-500',
    border: 'border-slate-200',
    accent: 'text-blue-600',
    success: 'text-emerald-600',
    error: 'text-red-600',
    isDark: false,
  },
  cream: {
    name: 'Cream',
    bg: 'bg-[#faf6f1]',
    card: 'bg-[#fff9f3]',
    cardHover: 'hover:bg-[#f5ebe0]',
    primary: 'bg-amber-700',
    primaryHover: 'hover:bg-amber-800',
    text: 'text-amber-950',
    textMuted: 'text-amber-800/60',
    border: 'border-amber-200',
    accent: 'text-amber-700',
    success: 'text-emerald-700',
    error: 'text-red-700',
    isDark: false,
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(() => {
    return localStorage.getItem('hifz-theme') || 'ocean';
  });

  const theme = THEMES[themeName] || THEMES.ocean;

  useEffect(() => {
    localStorage.setItem('hifz-theme', themeName);
    
    if (theme.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeName, theme.isDark]);

  const setTheme = (name) => {
    if (THEMES[name]) {
      setThemeName(name);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
