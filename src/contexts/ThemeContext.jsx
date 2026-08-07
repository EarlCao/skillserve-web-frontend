import { createContext, useContext } from 'react'

/** Theme context — see providers/ThemeProvider for the implementation. */
export const ThemeContext = createContext(null)

/**
 * Access theme state. Must be used inside <ThemeProvider>.
 *
 * @returns {{ theme: string, setTheme: (theme: string) => void, toggleTheme: () => void }}
 */
export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within <ThemeProvider>.')
  }

  return context
}
