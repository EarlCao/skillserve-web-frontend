/**
 * The admin web's appearance (System Settings → Appearance): theme colour,
 * font and text size, applied to <html> so the whole app — including the
 * sign-in page — follows it. Values mirror the backend's `appearance` group.
 */

/** Fonts an administrator can pick; `family` is the Google Fonts name. */
export const FONT_OPTIONS = [
  { value: 'system', label: 'System default', family: null },
  { value: 'inter', label: 'Inter', family: 'Inter' },
  { value: 'poppins', label: 'Poppins', family: 'Poppins' },
  { value: 'roboto', label: 'Roboto', family: 'Roboto' },
  { value: 'outfit', label: 'Outfit (as in the mobile app)', family: 'Outfit' },
  { value: 'nunito', label: 'Nunito', family: 'Nunito' },
  { value: 'open_sans', label: 'Open Sans', family: 'Open Sans' },
  { value: 'montserrat', label: 'Montserrat', family: 'Montserrat' },
]

/** Root font sizes; every Tailwind size is in rem, so the whole UI scales. */
export const FONT_SIZE_OPTIONS = [
  { value: 'small', label: 'Small', size: '87.5%' },
  { value: 'medium', label: 'Medium (default)', size: '100%' },
  { value: 'large', label: 'Large', size: '112.5%' },
  { value: 'extra_large', label: 'Extra large', size: '125%' },
]

/** The built-in SkillServe green (light theme), shown when no colour is set. */
export const DEFAULT_PRIMARY = '#03833e'

const FONT_LINK_ID = 'skillserve-app-font'

/** White or dark-green text, whichever reads better on [hex]. */
export function contentColorFor(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const linear = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const luminance = 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)

  return luminance > 0.4 ? '#052e16' : '#ffffff'
}

function loadFont(family) {
  const existing = document.getElementById(FONT_LINK_ID)
  if (!family) {
    existing?.remove()
    return
  }

  const href = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@400;500;600;700&display=swap`
  if (existing?.getAttribute('href') === href) return

  const link = existing ?? Object.assign(document.createElement('link'), { id: FONT_LINK_ID, rel: 'stylesheet' })
  link.href = href
  if (!existing) document.head.appendChild(link)
}

/** Apply [appearance] (the API's `data`) to the document. */
export function applyAppearance(appearance) {
  const root = document.documentElement
  const color = /^#[0-9a-fA-F]{6}$/.test(appearance?.primary_color ?? '') ? appearance.primary_color : null

  if (color) {
    // Inline on <html>, so it wins over both the light and the dark theme.
    root.style.setProperty('--color-primary', color)
    root.style.setProperty('--color-primary-content', contentColorFor(color))
  } else {
    root.style.removeProperty('--color-primary')
    root.style.removeProperty('--color-primary-content')
  }

  const font = FONT_OPTIONS.find((option) => option.value === appearance?.font_family)?.family ?? null
  loadFont(font)
  font
    ? root.style.setProperty('--app-font', `'${font}', system-ui, 'Segoe UI', Roboto, sans-serif`)
    : root.style.removeProperty('--app-font')

  root.style.fontSize = FONT_SIZE_OPTIONS.find((option) => option.value === appearance?.font_size)?.size ?? ''
}
