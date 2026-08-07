import { z } from 'zod'

/**
 * Change-password form validation. Mirrors the backend rules
 * (ChangePasswordRequest: current_password required, password min:8 + confirmed).
 */
export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Enter your current password.'),
    password: z.string().min(8, 'New password must be at least 8 characters.'),
    password_confirmation: z.string().min(1, 'Confirm your new password.'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match.',
    path: ['password_confirmation'],
  })
