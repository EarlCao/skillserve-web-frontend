import { z } from 'zod'

/** Mirrors ForgotPasswordRequest. */
export const forgotPasswordSchema = z.object({
  email: z.email('Enter a valid email address.'),
})

/** Mirrors ResetPasswordRequest (password min:8 + confirmed). */
export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'New password must be at least 8 characters.'),
    password_confirmation: z.string().min(1, 'Confirm your new password.'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match.',
    path: ['password_confirmation'],
  })
