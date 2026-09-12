import axios from 'axios'
import { API_BASE_URL, APP_EVENTS, HTTP_STATUS, STORAGE_KEYS } from '../constants'
import { getErrorMessage } from '../lib/errors'

/**
 * Shared axios instance.
 *
 * Response interceptor normalizes every failure into a consistent shape:
 *   { message, status, data, errors }
 * so callers can rely on `error.message` regardless of the failure type.
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120_000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// Attach an auth token if one is stored. AuthProvider persists it through
// useLocalStorage, which JSON-stringifies values — so parse the stored JSON
// (e.g. `"abc123"` → `abc123`) and fall back to the raw value if it was
// written by something that didn't use the hook.
axiosInstance.interceptors.request.use((config) => {
  const stored = localStorage.getItem(STORAGE_KEYS.token)
  let token = null

  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      // useLocalStorage stores JSON (`"abc123"`). A parsed null means the
      // session was explicitly cleared → send no header. Fall back to the
      // raw value for anything written without the hook.
      token = typeof parsed === 'string' && parsed ? parsed : null
    } catch {
      token = stored
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status ?? null
    const data = error.response?.data
    const isLoginRequest = error.config?.url?.includes('/auth/login')

    // Expired or revoked session → drop the stored token and let the
    // AuthProvider clear the authenticated state.
    if (status === HTTP_STATUS.UNAUTHORIZED && !isLoginRequest) {
      localStorage.removeItem(STORAGE_KEYS.token)
      window.dispatchEvent(new Event(APP_EVENTS.unauthorized))
    }

    // Provide a clear message when the device is offline or the server
    // is unreachable (common on mobile with flaky connectivity).
    let message
    if (!error.response && error.code === 'ERR_NETWORK') {
      message = 'No internet connection. Please check your network and try again.'
    } else if (error.code === 'ECONNABORTED') {
      message = 'Request timed out. The server took too long to respond.'
    } else {
      message =
        (data && (data.message || getErrorMessage(data.errors))) ||
        error.message ||
        'Something went wrong. Please try again.'
    }

    // Normalize the error so every caller gets a consistent shape.
    error.normalized = {
      status,
      message,
      errors: data?.errors ?? null,
      data,
    }

    return Promise.reject(error.normalized)
  },
)

export default axiosInstance
