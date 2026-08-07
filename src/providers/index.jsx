import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { APP_CONFIG } from '../app/config'
import { queryClient } from '../lib/queryClient'
import { Toaster } from '../components/feedback/Toaster'
import AuthProvider from './AuthProvider'
import ThemeProvider from './ThemeProvider'

/**
 * Composes every application-level provider.
 *
 * Order matters: ThemeProvider wraps the Toaster so it can pick up the theme;
 * QueryClientProvider provides React Query to the whole tree.
 */
export default function AppProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          {children}
          <Toaster />
          {APP_CONFIG.isDev && <ReactQueryDevtools initialIsOpen={false} />}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
