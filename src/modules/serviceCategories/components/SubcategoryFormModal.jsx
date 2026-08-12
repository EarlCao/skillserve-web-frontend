import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import ConfirmDialog from '../../../components/feedback/ConfirmDialog'
import FormField from '../../../components/forms/FormField'
import { serviceSubcategorySchema } from '../schemas/serviceCategorySchema'
import { useCreateSubcategory, useUpdateSubcategory } from '../hooks/useServiceCategories'

const toDefaults = (subcategory) => ({
  name: subcategory?.name ?? '',
  description: subcategory?.description ?? '',
  status: subcategory?.status ?? 'enabled',
})

/**
 * Create / edit subcategory modal. Always scoped to a parent category — the
 * subcategory is created under (or edited within) `categoryId`.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {number} props.categoryId  parent category id
 * @param {object|null} props.subcategory  the record being edited, or null to create
 */
export default function SubcategoryFormModal({ open, onClose, categoryId, subcategory }) {
  const isEditing = Boolean(subcategory)

  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(serviceSubcategorySchema),
    defaultValues: toDefaults(subcategory),
  })

  // Re-seed the form whenever the target (or the modal) changes.
  useEffect(() => {
    if (open) {
      reset(toDefaults(subcategory))
    }
  }, [open, subcategory, reset])

  const createMutation = useCreateSubcategory()
  const updateMutation = useUpdateSubcategory()
  const mutation = isEditing ? updateMutation : createMutation

  // Ask for confirmation before discarding unsaved edits.
  const requestClose = () => {
    if (isDirty && !mutation.isPending) {
      setConfirmDiscardOpen(true)

      return
    }

    onClose()
  }

  const confirmDiscard = () => {
    setConfirmDiscardOpen(false)
    onClose()
  }

  const onSubmit = (values) => {
    const options = {
      onSuccess: () => {
        if (!isEditing) {
          reset()
        }
        onClose()
      },
      onError: (error) => {
        // Map server-side field errors onto the form (422 envelope).
        if (error?.errors && typeof error.errors === 'object') {
          Object.entries(error.errors).forEach(([field, messages]) => {
            setError(field, { message: Array.isArray(messages) ? messages[0] : String(messages) })
          })
        }
      },
    }

    if (isEditing) {
      mutation.mutate(
        { categoryId, subcategoryId: subcategory.id, ...values },
        options,
      )
    } else {
      mutation.mutate({ categoryId, ...values }, options)
    }
  }

  return (
    <>
      <Modal
        open={open}
        onClose={requestClose}
        title={isEditing ? 'Edit subcategory' : 'Add subcategory'}
        description={
          isEditing
            ? 'Update this subcategory within its parent category.'
            : 'Add a subcategory under the parent category.'
        }
        footer={
          <>
            <Button variant="ghost" onClick={requestClose} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" form="subcategory-form" loading={mutation.isPending}>
              {isEditing ? 'Save changes' : 'Add subcategory'}
            </Button>
          </>
        }
      >
        <form id="subcategory-form" onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <FormField label="Name" required error={errors.name?.message} hint="Unique within this category.">
            <Input autoComplete="off" placeholder="e.g. Plumbing" {...register('name')} />
          </FormField>

          <FormField label="Description" error={errors.description?.message}>
            <textarea
              className={`textarea textarea-bordered w-full ${errors.description ? 'textarea-error' : ''}`}
              rows={2}
              placeholder="Optional description…"
              {...register('description')}
            />
          </FormField>

          <FormField label="Status" required error={errors.status?.message}>
            <select className="select select-bordered w-full" {...register('status')}>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </FormField>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDiscardOpen}
        onCancel={() => setConfirmDiscardOpen(false)}
        onConfirm={confirmDiscard}
        title="Discard unsaved changes?"
        description="You have unsaved changes. They will be lost if you close this form."
        confirmText="Discard"
        variant="error"
      />
    </>
  )
}
