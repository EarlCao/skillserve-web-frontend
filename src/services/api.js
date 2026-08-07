import axiosInstance from './axios'

/**
 * Generic API helpers.
 *
 * Every method resolves to the full backend envelope:
 *   { success, message, data, errors, meta }
 *
 * Module-specific endpoints will build on these — never call the raw axios
 * instance directly from feature code.
 */
export const api = {
  get: (url, config) => axiosInstance.get(url, config).then(({ data }) => data),
  post: (url, body, config) => axiosInstance.post(url, body, config).then(({ data }) => data),
  put: (url, body, config) => axiosInstance.put(url, body, config).then(({ data }) => data),
  patch: (url, body, config) => axiosInstance.patch(url, body, config).then(({ data }) => data),
  delete: (url, config) => axiosInstance.delete(url, config).then(({ data }) => data),
}
