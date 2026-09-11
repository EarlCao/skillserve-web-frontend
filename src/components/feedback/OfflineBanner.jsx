import { WifiOff } from 'lucide-react'
import { useNetworkStatus } from '../../hooks/useNetworkStatus'

/**
 * Persistent banner shown when the device is offline.
 * Renders nothing when online.
 */
export default function OfflineBanner() {
  const { isOnline } = useNetworkStatus()

  if (isOnline) return null

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-warning px-4 py-2 text-sm font-medium text-warning-content shadow-md">
      <WifiOff className="size-4 shrink-0" />
      <span>You are offline. Some features may be unavailable.</span>
    </div>
  )
}
