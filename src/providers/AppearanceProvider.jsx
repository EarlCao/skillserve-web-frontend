import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS, STORAGE_KEYS } from '../constants'
import { settingsApi } from '../modules/settings/api/settingsApi'
import { applyAppearance } from '../utils/appearance'

function cached() {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEYS.appearance) ?? 'null')
  } catch {
    return null
  }
}

/**
 * Applies System Settings → Appearance (theme colour, font, text size) to the
 * whole admin web. The last known appearance is kept in localStorage and
 * applied at once, so a reload does not flash the default look before the
 * public GET /api/appearance answers. Saving settings refreshes it.
 */
export default function AppearanceProvider({ children }) {
  const { data } = useQuery({
    queryKey: QUERY_KEYS.settings.appearance,
    queryFn: settingsApi.appearance,
    staleTime: 5 * 60_000,
  })

  const appearance = data?.data ?? cached()

  useEffect(() => {
    if (!appearance) return
    applyAppearance(appearance)
    try {
      window.localStorage.setItem(STORAGE_KEYS.appearance, JSON.stringify(appearance))
    } catch {
      // Private mode or a full quota: the appearance still applies.
    }
  }, [appearance])

  return children
}
