import { APP_CONFIG } from '../app/config'

export const APP_NAME = APP_CONFIG.name

export const API_BASE_URL = APP_CONFIG.apiBaseUrl

/** LocalStorage keys. */
export const STORAGE_KEYS = {
  theme: 'skillserve:theme',
  token: 'skillserve:token',
}

/** Available daisyui themes. */
export const THEMES = ['light', 'dark']

/** Window events the app listens to. */
export const APP_EVENTS = {
  unauthorized: 'skillserve:unauthorized',
}

/** React Query cache keys (grow as modules are added). */
export const QUERY_KEYS = {
  auth: {
    all: ['auth'],
    me: ['auth', 'me'],
  },
  administrators: {
    all: ['administrators'],
    list: (params) => ['administrators', 'list', params],
  },
  roles: {
    all: ['roles'],
    list: (params) => ['roles', 'list', params],
  },
  permissions: {
    all: ['permissions'],
    matrix: ['permissions', 'matrix'],
  },
  users: {
    all: ['users'],
    list: (params) => ['users', 'list', params],
    detail: (id) => ['users', 'detail', id],
    history: (id) => ['users', 'history', id],
  },
  serviceCategories: {
    all: ['service-categories'],
    list: (params) => ['service-categories', 'list', params],
    detail: (id) => ['service-categories', 'detail', id],
  },
  providers: {
    all: ['providers'],
    list: (params) => ['providers', 'list', params],
    detail: (id) => ['providers', 'detail', id],
    verificationHistory: (id) => ['providers', 'verification-history', id],
  },
}

/** Common HTTP status codes. */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
}
