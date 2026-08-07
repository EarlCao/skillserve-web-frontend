import { z } from 'zod'

/**
 * User profile form validation. Mirrors the backend rules
 * (UpdateUserRequest). Only the editable profile fields are included —
 * status and roles are changed through dedicated actions.
 */
export const userUpdateSchema = z.object({
  first_name: z.string().min(1, 'First name is required.'),
  last_name: z.string().min(1, 'Last name is required.'),
  email: z.string().min(1, 'Email is required.').email('Enter a valid email address.'),
  phone: z.string().max(30, 'Phone number must not exceed 30 characters.').optional().or(z.literal('')),
  address: z.string().max(1000, 'Address must not exceed 1000 characters.').optional().or(z.literal('')),
  // date input submits "YYYY-MM-DD" or an empty string when cleared.
  birthday: z.string().optional().or(z.literal('')),
  user_type: z.enum(['customer']).default('customer'),
})
