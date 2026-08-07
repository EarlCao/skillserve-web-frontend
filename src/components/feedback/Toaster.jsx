import { Toaster as SonnerToaster } from 'sonner'
import { useTheme } from '../../contexts/ThemeContext'

/**
 * Global toast host (Sonner), theme-aware.
 */
export function Toaster() {
  const { theme } = useTheme()

  return (
    <SonnerToaster
      richColors
      closeButton
      position="top-right"
      theme={theme === 'dark' ? 'dark' : 'light'}
    />
  )
}
