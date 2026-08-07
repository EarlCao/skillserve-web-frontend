import { z } from 'zod'

/**
 * Login form validation (zod v4 — z.email() is the top-level string format).
 */
export const loginSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
})
