import { z } from 'zod'

/**
 * Schema for the administrator service edit form (listing details only;
 * pricing, duration and location belong to the provider).
 */
export const serviceFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255, 'Title must be 255 characters or less'),
  description: z.string().max(5000, 'Description must be 5000 characters or less').optional().nullable(),
  category_id: z.string().min(1, 'Category is required'),
  subcategory_id: z.string().optional().nullable(),
})

/**
 * Schema for the service rejection form.
 */
export const rejectServiceSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required').max(1000, 'Reason must be 1000 characters or less'),
})

/**
 * Schema for the service approval notes form.
 */
export const approveServiceSchema = z.object({
  notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional().nullable(),
})
