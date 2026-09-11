import { QueryClient } from '@tanstack/react-query'

/**
 * Shared React Query client.
 *
 * - Retries only network-ish failures, never HTTP 4xx responses.
 * - Exponential back-off retry delays for mobile-friendly connectivity.
 * - Auto-refetches when the browser reconnects after being offline.
 * - Data stays fresh for 60 s before refetching.
 * - No refetch on window focus (avoids surprising the user).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
      retry: (failureCount, error) => {
        // Don't retry when the server answered (normalized errors carry a status).
        if (typeof error?.status === 'number') return false
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000),
    },
    mutations: {
      retry: false,
    },
  },
})
