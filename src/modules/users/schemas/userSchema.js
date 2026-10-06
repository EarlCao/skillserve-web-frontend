import { z } from 'zod'

/**
 * User profile form validation. Mirrors the backend rules
 * (UpdateUserRequest). Only the editable profile fields are included —
 * status and roles are changed through dedicated actions.
 */
// A Philippine mobile number, typed any usual way (09…, +63…, with spaces or
// dashes); the API stores it as 11 digits, 09123456789 (PhilippineMobileNumber).
const PH_MOBILE = /^(?:\+?63|0)?9\d{9}$/
const PH_MOBILE_MESSAGE = 'Enter an 11-digit Philippine mobile number starting with 09, e.g. 09123456789.'

export const userUpdateSchema = z.object({
  first_name: z.string().min(1, 'First name is required.'),
  last_name: z.string().min(1, 'Last name is required.'),
  email: z.string().min(1, 'Email is required.').email('Enter a valid email address.'),
  phone: z
    .string()
    .refine((value) => value.trim() === '' || PH_MOBILE.test(value.replace(/[\s\-.()]/g, '')), PH_MOBILE_MESSAGE)
    .optional(),
  address: z.string().max(1000, 'Address must not exceed 1000 characters.').optional().or(z.literal('')),
  // date input submits "YYYY-MM-DD" or an empty string when cleared.
  birthday: z.string().optional().or(z.literal('')),
  user_type: z.enum(['customer']).default('customer'),
})
