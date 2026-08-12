import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import ConfirmDialog from '../../../components/feedback/ConfirmDialog'
import FormField from '../../../components/forms/FormField'
import { serviceCategorySchema } from '../schemas/serviceCategorySchema'
import { useCreateServiceCategory, useUpdateServiceCategory } from '../hooks/useServiceCategories'

const toDefaults = (category) => ({
  name: category?.name ?? '',
  description: category?.description ?? '',
})

/**
 * Create / edit service category modal. Status is changed through the
 * dedicated enable/disable action, not this form.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {object|null} props.category  the record being edited, or null to create
 */
export default function CategoryFormModal({ open, onClose, category }) {
  const isEditing = Boolean(category)

  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(serviceCategorySchema),
    defaultValues: toDefaults(category),
  })

  // Re-seed the form whenever the target (or the modal) changes.
  useEffect(() => {
    if (open) {
      reset(toDefaults(category))
    }
  }, [open, category, reset])

  const createMutation = useCreateServiceCategory()
  const updateMutation = useUpdateServiceCategory()
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
        // Clear the form so a subsequent open starts fresh.
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
      mutation.mutate({ id: category.id, ...values }, options)
    } else {
      mutation.mutate(values, options)
    }
  }

  return (
    <>
      <Modal
        open={open}
        onClose={requestClose}
        title={isEditing ? 'Edit service category' : 'Add service category'}
        description={
          isEditing
            ? 'Update the category name or description.'
            : 'Create a new category for organizing available services. You can add subcategories afterwards.'
        }
        footer={
          <>
            <Button variant="ghost" onClick={requestClose} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" form="service-category-form" loading={mutation.isPending}>
              {isEditing ? 'Save changes' : 'Create category'}
            </Button>
          </>
        }
      >
        <form
          id="service-category-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          <FormField label="Name" required error={errors.name?.message} hint="Unique category name.">
            <Input autoComplete="off" placeholder="e.g. Home Maintenance" {...register('name')} />
          </FormField>

          <FormField label="Description" error={errors.description?.message}>
            <textarea
              className={`textarea textarea-bordered w-full ${errors.description ? 'textarea-error' : ''}`}
              rows={3}
              placeholder="What kind of services belong here?"
              {...register('description')}
            />
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
