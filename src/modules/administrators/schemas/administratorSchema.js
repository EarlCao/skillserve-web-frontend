import { z } from 'zod'

/**
 * Administrator form validation. Mirrors the backend rules
 * (StoreAdministratorRequest / UpdateAdministratorRequest).
 */

export const administratorCreateSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required.'),
    last_name: z.string().min(1, 'Last name is required.'),
    email: z.string().min(1, 'Email is required.').email('Enter a valid email address.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    password_confirmation: z.string().min(1, 'Confirm your password.'),
    role: z.string().min(1, 'Select a role.'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match.',
    path: ['password_confirmation'],
  })

export const administratorUpdateSchema = z.object({
  first_name: z.string().min(1, 'First name is required.'),
  last_name: z.string().min(1, 'Last name is required.'),
  email: z.string().min(1, 'Email is required.').email('Enter a valid email address.'),
  role: z.string().min(1, 'Select a role.'),
  status: z.enum(['active', 'inactive']),
})
