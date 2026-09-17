import { format } from 'date-fns'
import { DEFAULT_CURRENCY } from '../constants'

const currencyFormat = new Intl.NumberFormat('en-PH', { style: 'currency', currency: DEFAULT_CURRENCY })

/** Format an amount in Philippine pesos, e.g. "₱1,500.00". */
export function formatCurrency(value) {
  if (value == null || value === '') return '—'
  const amount = Number(value)
  return Number.isNaN(amount) ? '—' : currencyFormat.format(amount)
}

/** Format a date as e.g. "Jan 15, 2026". */
export function formatDate(date, pattern = 'MMM d, yyyy') {
  if (!date) return '—'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '—'
  return format(d, pattern)
}

/** Format a date and time as e.g. "Jan 15, 2026 3:45 PM". */
export function formatDateTime(date, pattern = 'MMM d, yyyy h:mm a') {
  return formatDate(date, pattern)
}

/** Truncate a string to `length` characters, adding an ellipsis. */
export function truncate(value, length = 50) {
  if (!value) return ''
  return value.length > length ? `${value.slice(0, length - 1)}…` : value
}

/** Convert a string to a URL-safe slug. */
export function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
