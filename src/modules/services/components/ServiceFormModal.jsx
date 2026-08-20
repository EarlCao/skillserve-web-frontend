import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Modal from '../../../components/ui/Modal'
import Button from '../../../components/ui/Button'
import FormField from '../../../components/forms/FormField'
import Input from '../../../components/ui/Input'
import Textarea from '../../../components/ui/Textarea'
import { useCreateService, useUpdateService } from '../hooks/useServices'
import { serviceFormSchema } from '../schemas/serviceSchema'

/**
 * Modal form for creating or editing a service.
 */
export default function ServiceFormModal({ open, onClose, service, categories = [] }) {
  const isEditing = Boolean(service)
  const createMutation = useCreateService()
  const updateMutation = useUpdateService()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category_id: '',
      subcategory_id: '',
      price: '',
      price_type: 'fixed',
      currency: 'USD',
      duration: '',
      location: '',
    },
  })

  // Reset form when service or open state changes.
  useEffect(() => {
    if (open) {
      if (service) {
        reset({
          title: service.title ?? '',
          description: service.description ?? '',
          category_id: service.category_id ?? '',
          subcategory_id: service.subcategory_id ?? '',
          price: service.price ?? '',
          price_type: service.price_type ?? 'fixed',
          currency: service.currency ?? 'USD',
          duration: service.duration ?? '',
          location: service.location ?? '',
        })
      } else {
        reset({
          title: '',
          description: '',
          category_id: '',
          subcategory_id: '',
          price: '',
          price_type: 'fixed',
          currency: 'USD',
          duration: '',
          location: '',
        })
      }
    }
  }, [open, service, reset])

  const onSubmit = (data) => {
    const payload = {
      ...data,
      price: data.price ? Number(data.price) : null,
      category_id: Number(data.category_id),
      subcategory_id: data.subcategory_id ? Number(data.subcategory_id) : null,
    }

    const mutation = isEditing ? updateMutation : createMutation

    mutation.mutate(
      isEditing ? { id: service.id, ...payload } : payload,
      {
        onSuccess: () => {
          reset()
          onClose()
        },
      },
    )
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Service' : 'Create Service'}
      description={isEditing ? 'Update the service information below.' : 'Fill in the details to create a new service.'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={isPending}>
            {isEditing ? 'Update Service' : 'Create Service'}
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
          <select
            {...register('category_id')}
            className="select select-bordered w-full"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Price" error={errors.price?.message}>
            <Input {...register('price')} type="number" step="0.01" min="0" placeholder="0.00" />
          </FormField>

          <FormField label="Price Type" error={errors.price_type?.message}>
            <select
              {...register('price_type')}
              className="select select-bordered w-full"
            >
              <option value="fixed">Fixed</option>
              <option value="hourly">Hourly</option>
              <option value="custom">Custom</option>
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Duration" error={errors.duration?.message}>
            <Input {...register('duration')} placeholder="e.g. 2 hours" />
          </FormField>

          <FormField label="Location" error={errors.location?.message}>
            <Input {...register('location')} placeholder="Service location" />
          </FormField>
        </div>
      </form>
    </Modal>
  )
}
