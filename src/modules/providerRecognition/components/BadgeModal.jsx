import { useState } from 'react'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Textarea from '../../../components/ui/Textarea'

export default function BadgeModal({ open, onClose, badge, mutation }) {
  const [form, setForm] = useState(() => ({
    name: badge?.name ?? '',
    slug: badge?.slug ?? '',
    description: badge?.description ?? '',
    color: badge?.color ?? 'primary',
    is_active: badge?.is_active ?? true,
  }))
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const submit = (event) => {
    event.preventDefault()
    mutation.mutate(badge ? { id: badge.id, ...form } : form, { onSuccess: onClose })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={badge ? 'Edit provider badge' : 'Create provider badge'}
      description="Define a recognition badge that can be assigned to qualified providers."
      boxClassName="max-w-lg"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" form="badge-form" loading={mutation.isPending}>{badge ? 'Save changes' : 'Create badge'}</Button></>}
    >
      <form id="badge-form" className="flex flex-col gap-4" onSubmit={submit}>
        <Input label="Name" value={form.name} onChange={update('name')} required maxLength={100} placeholder="Top Rated" />
        <Input label="Slug" value={form.slug} onChange={update('slug')} required maxLength={120} placeholder="top-rated" hint="Use letters, numbers, dashes, or underscores." />
        <Textarea label="Description" value={form.description} onChange={update('description')} maxLength={1000} rows={3} placeholder="What does this badge recognize?" />
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="badge-color">Color</label>
          <select id="badge-color" className="select select-bordered w-full" value={form.color} onChange={update('color')}>
            {['primary', 'secondary', 'accent', 'success', 'info', 'warning', 'error'].map((color) => <option key={color} value={color}>{color}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" className="checkbox checkbox-sm" checked={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} /> Active badge</label>
      </form>
    </Modal>
  )
}
