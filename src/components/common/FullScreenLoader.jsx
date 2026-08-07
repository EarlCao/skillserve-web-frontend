import Spinner from '../ui/Spinner'

/**
 * Full-screen loading state, used while authentication state resolves.
 */
export default function FullScreenLoader() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 bg-base-100">
      <Spinner size="lg" className="text-primary" />
      <p className="text-sm text-base-content/60" aria-live="polite">
        Loading…
      </p>
    </div>
  )
}
