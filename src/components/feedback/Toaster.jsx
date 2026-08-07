import { Toaster as SonnerToaster } from 'sonner'
import { useTheme } from '../../contexts/ThemeContext'
import './toaster.css'

/**
 * Global toast host (Sonner), theme-aware.
 *
 * Positioned bottom-right; the front toast slides in from the right edge and
 * slides back out to the right when dismissed (see toaster.css).
 */
export function Toaster() {
  const { theme } = useTheme()

  return (
    <SonnerToaster
      richColors
      closeButton
      position="bottom-right"
      theme={theme === 'dark' ? 'dark' : 'light'}
    />
  )
}
