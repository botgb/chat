import { createContext, ReactNode, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { Colors, darkColors, lightColors } from '../theme';

export type ThemeMode = 'system' | 'light' | 'dark';

const ThemeCtx = createContext<{ colors: Colors; dark: boolean }>({ colors: lightColors, dark: false });

export function ThemeProvider({ mode, children }: { mode: ThemeMode; children: ReactNode }) {
  const system = useColorScheme();
  const dark = mode === 'dark' || (mode === 'system' && system === 'dark');
  const value = useMemo(() => ({ colors: dark ? darkColors : lightColors, dark }), [dark]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export const useColors = () => useContext(ThemeCtx).colors;
export const useIsDark = () => useContext(ThemeCtx).dark;

/** Estilos que dependem do tema: recriados só quando as cores mudam. */
export function useStyles<T>(factory: (colors: Colors) => T): T {
  const colors = useColors();
  return useMemo(() => factory(colors), [colors, factory]);
}
