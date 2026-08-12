import { z } from 'zod'

/**
 * Service category form validation. Mirrors the backend rules
 * (StoreServiceCategoryRequest / UpdateServiceCategoryRequest).
 */
export const serviceCategorySchema = z.object({
  name: z.string().min(1, 'Name is required.').max(255, 'Name must not exceed 255 characters.'),
  description: z.string().max(1000, 'Description must not exceed 1000 characters.').optional().or(z.literal('')),
})

/**
 * Subcategory form validation. Mirrors the backend rules
 * (StoreServiceSubcategoryRequest / UpdateServiceSubcategoryRequest).
 * Status is editable in the form; duplicate names are enforced server-side
 * per category.
 */
export const serviceSubcategorySchema = z.object({
  name: z.string().min(1, 'Name is required.').max(255, 'Name must not exceed 255 characters.'),
  description: z.string().max(1000, 'Description must not exceed 1000 characters.').optional().or(z.literal('')),
  status: z.enum(['enabled', 'disabled']).default('enabled'),
})
