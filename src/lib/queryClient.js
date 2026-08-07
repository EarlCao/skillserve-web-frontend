import { QueryClient } from '@tanstack/react-query'

/**
 * Shared React Query client.
 *
 * - Retries only network-ish failures, never HTTP 4xx responses.
 * - Data stays fresh for 60s before refetching.
 * - No refetch on window focus (avoids surprising the user).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry when the server answered (normalized errors carry a status).
        if (typeof error?.status === 'number') return false
        return failureCount < 2
      },
    },
    mutations: {
      retry: false,
    },
  },
})
