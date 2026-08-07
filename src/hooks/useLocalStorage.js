import { useCallback, useEffect, useState } from 'react'

/**
 * useState persisted to localStorage.
 *
 * @param {string} key
 * @param {unknown} initialValue
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item !== null ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value) => {
      setStoredValue((prev) => {
        const next = typeof value === 'function' ? value(prev) : value

        try {
          window.localStorage.setItem(key, JSON.stringify(next))
        } catch {
          // Ignore quota / private-mode errors.
        }

        return next
      })
    },
    [key],
  )

  // Keep the stored value in sync if another tab changes it.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === key) {
        try {
          setStoredValue(event.newValue ? JSON.parse(event.newValue) : initialValue)
        } catch {
          setStoredValue(initialValue)
        }
      }
    }

    window.addEventListener('storage', onStorage)

    return () => window.removeEventListener('storage', onStorage)
  }, [key, initialValue])

  return [storedValue, setValue]
}
