/**
 * Extract a human-readable message from an unknown error.
 *
 * Works with normalized axios errors, Error instances, and strings.
 *
 * @param {unknown} error
 * @param {string} fallback
 * @returns {string}
 */
export function getErrorMessage(error, fallback = 'Something went wrong.') {
  if (!error) return fallback

  if (typeof error === 'string') return error

  if (error instanceof Error) return error.message || fallback

  if (typeof error === 'object') {
    // Normalized axios error: { message, errors, status }
    if (error.message) return String(error.message)
  }

  return fallback
}
