import { useState } from 'react'
import { Save, Settings as SettingsIcon, TriangleAlert } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import ErrorState from '../../../components/common/ErrorState'
import Skeleton from '../../../components/ui/Skeleton'
import Input from '../../../components/ui/Input'
import { useSettings, useUpdateSettings } from '../hooks/useSettings'

const GROUPS = [
  ['general', 'General', 'Platform identity and preferences.'],
  ['marketplace', 'Marketplace', 'Rules for providers, services, and marketplace operations.'],
  ['identity', 'Identity', 'National ID verification. The requirement ships off; turning it on stops unverified accounts booking or taking work.'],
  ['booking', 'Booking', 'Booking and cancellation rules. A confirmed booking cancelled inside the window records the fee of whoever cancelled.'],
  ['notifications', 'Notifications', 'System notification preferences.'],
  ['policies', 'Platform policies', 'Terms, privacy, and community guidance — shown in the mobile app.'],
  ['system', 'System', 'Technical and operational settings. Maintenance mode closes the mobile app (the admin web keeps working).'],
]

const labelFor = (name) => name.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

// Settings whose consequence is not obvious from the label. Keyed by
// "group.name" so a name reused in another group cannot pick up the wrong one.
const HINTS = {
  'general.timezone': 'Set by the server configuration (BUSINESS_TIMEZONE); provider hours and booking times use this timezone.',
  'identity.identity_verification_enforced_from': 'Accounts created before this date keep transacting unverified. Leave it empty and the requirement covers every existing account too.',
  'identity.identity_document_retention_days': 'How long National ID images are kept after a decision.',
  'marketplace.commission_block_min_amount': 'In pesos. A provider who owes less keeps taking new bookings; 0 blocks on any unpaid commission. Finishing agreed jobs is never blocked.',
  'marketplace.commission_block_after_days': 'Blocks even a small debt once the oldest unpaid commission is this many days old; 0 turns this off. Whichever limit is reached first applies.',
}

// Text inputs the browser should render as a date picker. The API sends values,
// not types, so the one date setting is named here rather than guessed at.
const DATE_FIELDS = new Set(['identity.identity_verification_enforced_from'])

export default function SettingsPage() {
  const { data, isLoading, isError, error, refetch } = useSettings()
  const updateMutation = useUpdateSettings()
  const [activeGroup, setActiveGroup] = useState('general')
  const [changes, setChanges] = useState({})

  const fields = { ...(data?.data?.[activeGroup] ?? {}), ...(changes[activeGroup] ?? {}) }
  // Values that come from server configuration (e.g. the timezone): shown,
  // never sent back.
  const readOnly = new Set(data?.meta?.read_only ?? [])
  const isReadOnly = (name) => readOnly.has(`${activeGroup}.${name}`)
  const inputType = (name, value) => {
    if (DATE_FIELDS.has(`${activeGroup}.${name}`)) return 'date'
    if (name.includes('email')) return 'email'
    return typeof value === 'number' ? 'number' : 'text'
  }
  // Turning the requirement on with no cutover date applies it to every
  // existing account at once, which stops the live marketplace until the
  // review queue is cleared. Say so before it is saved, not afterwards.
  const freezesExistingAccounts = activeGroup === 'identity'
    && fields.identity_verification_required === true
    && !String(fields.identity_verification_enforced_from ?? '').trim()
  const updateField = (name, value) => setChanges((current) => ({
    ...current,
    [activeGroup]: { ...current[activeGroup], [name]: value },
  }))

  const save = (event) => {
    event.preventDefault()
    updateMutation.mutate({ [activeGroup]: changes[activeGroup] ?? {} }, {
      onSuccess: () => setChanges((current) => ({ ...current, [activeGroup]: undefined })),
    })
  }

  if (isLoading) {
    return <div className="flex flex-col gap-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-96 w-full" /></div>
  }

  if (isError) return <ErrorState title="Could not load system settings" message={error?.message} onRetry={refetch} />

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">System Settings</h1>
        <p className="text-sm text-base-content/60">Configure the platform preferences and operating rules.</p>
      </div>
      <Card bodyClassName="p-0">
        <div role="tablist" aria-label="Settings sections" className="tabs tabs-bordered overflow-x-auto px-4 pt-2">
          {GROUPS.map(([key, title]) => (
            <button key={key} type="button" role="tab" aria-selected={activeGroup === key} className={`tab whitespace-nowrap ${activeGroup === key ? 'tab-active' : ''}`} onClick={() => setActiveGroup(key)}>{title}</button>
          ))}
        </div>
        <form onSubmit={save} className="flex flex-col gap-5 p-4 md:p-6">
          <div><h2 className="text-lg font-semibold">{GROUPS.find(([key]) => key === activeGroup)?.[1]}</h2><p className="text-sm text-base-content/60">{GROUPS.find(([key]) => key === activeGroup)?.[2]}</p></div>
          {freezesExistingAccounts && (
            <div role="alert" className="alert alert-warning">
              <TriangleAlert className="size-5" />
              <span>Without a cutover date, every existing account must verify before it can book or take work — the marketplace stops until the review queue is cleared. Set &ldquo;Require it for accounts created from&rdquo; to the date you are switching over.</span>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(fields).map(([name, value]) => typeof value === 'boolean' ? (
              <label key={name} className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-base-300 p-4">
                <span className="font-medium">{labelFor(name)}</span>
                <input type="checkbox" className="toggle toggle-primary" checked={value} onChange={(event) => updateField(name, event.target.checked)} aria-label={labelFor(name)} />
              </label>
              ) : (
                <div key={name} className={activeGroup === 'policies' ? 'md:col-span-2' : ''}>
                {activeGroup === 'policies' || name.includes('description') ? <label className="form-control" htmlFor={`setting-${activeGroup}-${name}`}><span className="mb-1 text-sm font-medium">{labelFor(name)}</span><textarea id={`setting-${activeGroup}-${name}`} className="textarea textarea-bordered min-h-32 w-full" value={value ?? ''} onChange={(event) => updateField(name, event.target.value)} /></label> : <Input label={labelFor(name)} id={`setting-${activeGroup}-${name}`} type={inputType(name, value)} value={value ?? ''} disabled={isReadOnly(name)} hint={HINTS[`${activeGroup}.${name}`]} onChange={(event) => updateField(name, typeof value === 'number' ? Number(event.target.value) : event.target.value)} />}
              </div>
            ))}
          </div>
          <div className="flex justify-end border-t border-base-200 pt-4"><Button type="submit" loading={updateMutation.isPending}><Save className="size-4" /> Save changes</Button></div>
        </form>
      </Card>
      <div className="flex items-center gap-2 text-xs text-base-content/50"><SettingsIcon className="size-4" /> Changes are recorded in the security audit log.</div>
    </div>
  )
}
