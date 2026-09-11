import { useNetworkStatus } from '../../hooks/useNetworkStatus'
import Spinner from '../ui/Spinner'

/**
 * Thin banner that appears at the top of the viewport when the
 * backend is unreachable. Auto-hides when connectivity is restored.
 */
export default function OfflineBanner() {
  const { isOnline, isChecking } = useNetworkStatus({ pollInterval: 15_000 })

  if (isOnline) return null

  return (
    <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-warning px-4 py-2 text-sm font-medium text-warning-content shadow-sm">
      {isChecking ? (
        <Spinner size="sm" />
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a5 5 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" />
        </svg>
      )}
      <span>
        {isChecking
          ? 'Reconnecting...'
          : 'You are offline. Some features may be unavailable.'}
      </span>
    </div>
  )
}
