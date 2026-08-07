import { twMerge } from 'tailwind-merge'

/**
 * Merge class names and resolve Tailwind conflicts.
 *
 * @param {...(string | null | undefined | false)} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(inputs.filter(Boolean).join(' '))
}
