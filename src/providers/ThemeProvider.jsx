import { useCallback, useEffect, useMemo } from 'react'
import { ThemeContext } from '../contexts/ThemeContext'
import { STORAGE_KEYS, THEMES } from '../constants'
import { useLocalStorage } from '../hooks/useLocalStorage'

/**
 * Applies the selected daisyui theme via the data-theme attribute on <html>
 * and persists the choice in localStorage.
 */
export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useLocalStorage(STORAGE_KEYS.theme, THEMES[0])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === THEMES[0] ? THEMES[1] : THEMES[0]))
  }, [setTheme])

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
