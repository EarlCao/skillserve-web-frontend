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
  dashboard: {
    all: ['dashboard'],
    summary: ['dashboard', 'summary'],
  },
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
  services: {
    all: ['services'],
    list: (params) => ['services', 'list', params],
    detail: (id) => ['services', 'detail', id],
  },
  bookings: {
    all: ['bookings'],
    list: (params) => ['bookings', 'list', params],
    detail: (id) => ['bookings', 'detail', id],
    history: (id) => ['bookings', 'history', id],
  },
  disputes: {
    all: ['disputes'],
    list: (params) => ['disputes', 'list', params],
    detail: (id) => ['disputes', 'detail', id],
    history: (id) => ['disputes', 'history', id],
  },
  reviews: {
    all: ['reviews'],
    list: (params) => ['reviews', 'list', params],
    detail: (id) => ['reviews', 'detail', id],
  },
  reports: {
    all: ['reports'],
    list: (params) => ['reports', 'list', params],
    detail: (id) => ['reports', 'detail', id],
  },
  notifications: {
    all: ['notifications'],
    list: (params) => ['notifications', 'list', params],
    recipients: (target, search) => ['notifications', 'recipients', target, search],
  },
  analytics: {
    all: ['analytics'],
    reports: (type, params) => ['analytics', 'reports', type, params],
  },
  providerRecognition: {
    all: ['provider-recognition'],
    badges: (params) => ['provider-recognition', 'badges', params],
    providers: (params) => ['provider-recognition', 'providers', params],
    topRated: (params) => ['provider-recognition', 'top-rated', params],
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
