import { useState } from 'react'
import { Save, Settings as SettingsIcon } from 'lucide-react'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import ErrorState from '../../../components/common/ErrorState'
import Skeleton from '../../../components/ui/Skeleton'
import Input from '../../../components/ui/Input'
import { useSettings, useUpdateSettings } from '../hooks/useSettings'

const GROUPS = [
  ['general', 'General', 'Platform identity and preferences.'],
  ['marketplace', 'Marketplace', 'Rules for providers, services, and marketplace operations.'],
  ['booking', 'Booking', 'Booking and cancellation rules.'],
  ['notifications', 'Notifications', 'System notification preferences.'],
  ['policies', 'Platform policies', 'Terms, privacy, and community guidance.'],
  ['system', 'System', 'Technical and operational settings.'],
]

const labelFor = (name) => name.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

export default function SettingsPage() {
  const { data, isLoading, isError, error, refetch } = useSettings()
  const updateMutation = useUpdateSettings()
  const [activeGroup, setActiveGroup] = useState('general')
  const [changes, setChanges] = useState({})

  const fields = { ...(data?.data?.[activeGroup] ?? {}), ...(changes[activeGroup] ?? {}) }
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
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(fields).map(([name, value]) => typeof value === 'boolean' ? (
              <label key={name} className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-base-300 p-4">
                <span className="font-medium">{labelFor(name)}</span>
                <input type="checkbox" className="toggle toggle-primary" checked={value} onChange={(event) => updateField(name, event.target.checked)} aria-label={labelFor(name)} />
              </label>
            ) : (
              <div key={name} className={activeGroup === 'policies' ? 'md:col-span-2' : ''}>
                {activeGroup === 'policies' || name.includes('description') ? <label className="form-control"><span className="mb-1 text-sm font-medium">{labelFor(name)}</span><textarea className="textarea textarea-bordered min-h-32 w-full" value={value ?? ''} onChange={(event) => updateField(name, event.target.value)} /></label> : <Input label={labelFor(name)} type={name.includes('email') ? 'email' : typeof value === 'number' ? 'number' : 'text'} value={value ?? ''} onChange={(event) => updateField(name, typeof value === 'number' ? Number(event.target.value) : event.target.value)} />}
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
