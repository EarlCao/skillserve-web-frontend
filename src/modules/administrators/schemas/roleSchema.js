import { z } from 'zod'

/**
 * Role form validation. Mirrors the backend rules
 * (StoreRoleRequest / UpdateRoleRequest).
 */
export const roleSchema = z.object({
  name: z
    .string()
    .min(1, 'Role name is required.')
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers and hyphens only.'),
  description: z.string().max(500, 'Description must be under 500 characters.').optional().or(z.literal('')),
})
