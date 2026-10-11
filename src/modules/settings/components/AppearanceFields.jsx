import { RotateCcw } from 'lucide-react'
import Button from '../../../components/ui/Button'
import { DEFAULT_PRIMARY, FONT_OPTIONS, FONT_SIZE_OPTIONS, contentColorFor } from '../../../utils/appearance'

/**
 * System Settings → Appearance: the admin web's theme colour, font and text
 * size, for every administrator and the sign-in page. The preview shows the
 * unsaved choice; Save applies it everywhere (AppearanceProvider).
 */
export default function AppearanceFields({ fields, onChange }) {
  const color = /^#[0-9a-fA-F]{6}$/.test(fields.primary_color ?? '') ? fields.primary_color : ''
  const shown = color || DEFAULT_PRIMARY
  const font = FONT_OPTIONS.find((option) => option.value === fields.font_family)
  const size = FONT_SIZE_OPTIONS.find((option) => option.value === fields.font_size)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <label htmlFor="appearance-color" className="text-sm font-medium">Theme colour</label>
        <div className="flex items-center gap-3">
          <input
            id="appearance-color"
            type="color"
            className="h-11 w-16 cursor-pointer rounded-lg border border-base-300 bg-base-100 p-1"
            value={shown}
            onChange={(event) => onChange('primary_color', event.target.value)}
          />
          <span className="font-mono text-sm">{shown.toUpperCase()}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange('primary_color', '')}
            disabled={!color}
          >
            <RotateCcw className="size-4" /> SkillServe green
          </Button>
        </div>
        <p className="text-xs text-base-content/60">
          Buttons, links, highlights and the sidebar. Reset to keep the built-in green, which is a
          little brighter in dark mode.
        </p>
      </div>

      <label className="flex flex-col gap-2" htmlFor="appearance-font">
        <span className="text-sm font-medium">Font</span>
        <select
          id="appearance-font"
          className="select select-bordered w-full"
          value={fields.font_family ?? 'system'}
          onChange={(event) => onChange('font_family', event.target.value)}
        >
          {FONT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2" htmlFor="appearance-size">
        <span className="text-sm font-medium">Text size</span>
        <select
          id="appearance-size"
          className="select select-bordered w-full"
          value={fields.font_size ?? 'medium'}
          onChange={(event) => onChange('font_size', event.target.value)}
        >
          {FONT_SIZE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <span className="text-xs text-base-content/60">Scales the whole admin web, including menus and tables.</span>
      </label>

      {/* What the choice looks like, before it is saved. */}
      <div
        className="rounded-lg border border-base-300 p-4"
        style={{
          fontFamily: font?.family ? `'${font.family}', system-ui, sans-serif` : undefined,
          fontSize: size ? `calc(1rem * ${parseFloat(size.size) / 100})` : undefined,
        }}
        aria-label="Preview"
      >
        <p className="text-xs uppercase tracking-wide text-base-content/50">Preview</p>
        <p className="mt-1 font-semibold">Commission payments</p>
        <p className="text-base-content/70">Confirm the payments waiting for you.</p>
        <div className="mt-3 flex items-center gap-3">
          <span
            className="rounded-lg px-4 py-2 font-medium"
            style={{ backgroundColor: shown, color: contentColorFor(shown) }}
          >
            Confirm
          </span>
          <span className="font-medium underline" style={{ color: shown }}>View details</span>
        </div>
      </div>
    </div>
  )
}
