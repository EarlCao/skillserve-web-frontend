import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import FormField from '../../../components/forms/FormField'
import Input from '../../../components/ui/Input'
import Textarea from '../../../components/ui/Textarea'
import { useUpdateService } from '../hooks/useServices'
import { serviceFormSchema } from '../schemas/serviceSchema'
import { useServiceCategory } from '../../serviceCategories/hooks/useServiceCategories'

const toDefaults = (service) => ({
  title: service?.title ?? '',
  description: service?.description ?? '',
  category_id: service?.category_id ? String(service.category_id) : '',
  subcategory_id: service?.subcategory_id ? String(service.subcategory_id) : '',
})

/**
 * Modal form for correcting a provider's service listing. Providers own the
 * offer itself (pricing, duration, location); administrators can only fix the
 * listing details, and the provider is notified of every change.
 */
export default function ServiceFormModal({ open, onClose, service, categories = [] }) {
  const updateMutation = useUpdateService()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: toDefaults(service),
  })

  const selectedCategoryId = useWatch({ control, name: 'category_id' })
  const { data: selectedCategoryData } = useServiceCategory(selectedCategoryId)
  const subcategories = selectedCategoryData?.data?.subcategories ?? []

  // Re-seed the form whenever the target (or the modal) changes.
  useEffect(() => {
    if (open) reset(toDefaults(service))
  }, [open, service, reset])

  const onSubmit = (data) => {
    if (!service) return

    updateMutation.mutate(
      {
        id: service.id,
        title: data.title,
        description: data.description || null,
        category_id: Number(data.category_id),
        subcategory_id: data.subcategory_id ? Number(data.subcategory_id) : null,
      },
      { onSuccess: onClose },
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Service"
      description="Correct the listing details. The provider will be notified of your changes."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={updateMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={updateMutation.isPending}>
            Save changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Title" error={errors.title?.message} required>
          <Input {...register('title')} placeholder="Service title" />
        </FormField>

        <FormField label="Description" error={errors.description?.message}>
          <Textarea {...register('description')} placeholder="Describe the service..." rows={3} />
        </FormField>

        <FormField label="Category" error={errors.category_id?.message} required>
          <select {...register('category_id')} className="select select-bordered w-full">
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Subcategory" error={errors.subcategory_id?.message}>
          <select {...register('subcategory_id')} className="select select-bordered w-full" disabled={!selectedCategoryId}>
            <option value="">No subcategory</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </select>
        </FormField>

        <p className="text-xs text-base-content/60">
          Price, price type, duration and location are set by the provider and cannot be changed here.
        </p>
      </form>
    </Modal>
  )
}
