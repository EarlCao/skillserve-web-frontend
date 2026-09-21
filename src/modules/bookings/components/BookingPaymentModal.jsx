import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import Textarea from '../../../components/ui/Textarea'
import FormField from '../../../components/forms/FormField'
import { useMarkBookingPaid, useRefundBooking } from '../hooks/useBookings'
import { formatCurrency } from '../../../utils'

/** Mirrors MarkBookingPaidRequest. */
const markPaidSchema = z.object({
  payment_reference: z.string().trim().max(100, 'At most 100 characters.'),
})

/** What is still refundable on the booking. */
const remainingOf = (booking) =>
  Math.max(0, Number(booking?.total_price ?? 0) - Number(booking?.refunded_amount ?? 0))

/** Mirrors RefundBookingRequest; the upper bound is what is left to refund. */
const refundSchema = (remaining) =>
  z.object({
    amount: z.coerce
      .number({ message: 'Enter the amount refunded.' })
      .min(0.01, 'The amount must be at least 0.01.')
      .max(remaining, `At most ${remaining.toFixed(2)} can still be refunded.`)
      .refine((value) => Math.round(value * 100) / 100 === value, 'At most two decimal places.'),
    reason: z.string().trim().min(5, 'Record why the refund was made (at least 5 characters).').max(1000),
  })

/**
 * Records an off-platform settlement on a booking: `mode="paid"` marks it
 * paid, `mode="refund"` records a full or partial refund. No money moves
 * through SkillServe; both parties are notified and the action is audited.
 */
export default function BookingPaymentModal({ open, mode, booking, onClose }) {
  const isRefund = mode === 'refund'
  const remaining = remainingOf(booking)
  const markPaid = useMarkBookingPaid()
  const refund = useRefundBooking()
  const mutation = isRefund ? refund : markPaid

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isRefund ? refundSchema(remaining) : markPaidSchema),
    defaultValues: isRefund ? { amount: remaining, reason: '' } : { payment_reference: '' },
  })

  useEffect(() => {
    if (open) reset(isRefund ? { amount: remaining, reason: '' } : { payment_reference: '' })
  }, [open, isRefund, remaining, reset])

  const onSubmit = (values) => {
    const variables = isRefund
      ? { id: booking.id, amount: values.amount, reason: values.reason }
      : { id: booking.id, paymentReference: values.payment_reference }

    mutation.mutate(variables, {
      onSuccess: () => onClose(),
      onError: (error) => {
        // Map field errors from the 422 envelope onto the form; state errors
        // (already paid, not refundable) are shown by the mutation's toast.
        const fields = isRefund ? ['amount', 'reason'] : ['payment_reference']
        Object.entries(error?.errors ?? {}).forEach(([field, messages]) => {
          if (fields.includes(field)) {
            setError(field, { message: Array.isArray(messages) ? messages[0] : String(messages) })
          }
        })
      },
    })
  }

  if (!booking) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isRefund ? 'Record a refund' : 'Mark as paid'}
      description={
        isRefund
          ? `Record money returned to the customer for ${booking.booking_number}. ${formatCurrency(remaining)} can still be refunded.`
          : `Record that the customer paid ${formatCurrency(booking.total_price)} for ${booking.booking_number}. Nothing is charged through SkillServe.`
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="booking-payment-form"
            variant={isRefund ? 'warning' : 'success'}
            loading={mutation.isPending}
          >
            {isRefund ? 'Record refund' : 'Mark as paid'}
          </Button>
        </>
      }
    >
      <form id="booking-payment-form" onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {isRefund ? (
          <>
            <FormField label="Amount refunded" required error={errors.amount?.message}>
              <Input type="number" step="0.01" min="0.01" max={remaining} inputMode="decimal" {...register('amount')} />
            </FormField>
            <FormField label="Reason" required error={errors.reason?.message} hint="Both the customer and the provider see this.">
              <Textarea rows={3} placeholder="e.g. Job finished an hour short; partial refund agreed." {...register('reason')} />
            </FormField>
          </>
        ) : (
          <FormField
            label="Payment reference"
            error={errors.payment_reference?.message}
            hint="Optional — e.g. a GCash or bank transfer reference number."
          >
            <Input placeholder="GCASH-0123456789" autoComplete="off" {...register('payment_reference')} />
          </FormField>
        )}
      </form>
    </Modal>
  )
}
