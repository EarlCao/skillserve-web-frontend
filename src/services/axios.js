import axios from 'axios'
import { API_BASE_URL, STORAGE_KEYS } from '../constants'
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
  timeout: 30_000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// Attach an auth token if one is stored (Phase 1 will populate it).
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.token)

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

    // Normalize the error so every caller gets a consistent shape.
    error.normalized = {
      status,
      message:
        (data && (data.message || getErrorMessage(data.errors))) ||
        error.message ||
        'Network error. Please try again.',
      errors: data?.errors ?? null,
      data,
    }

    return Promise.reject(error.normalized)
  },
)

export default axiosInstance
