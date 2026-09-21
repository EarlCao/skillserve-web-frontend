import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '../../../constants'
import { bookingApi } from '../api/bookingApi'

/**
 * Paginated booking list (search/filter/sort are server-side).
 */
export function useBookings(params) {
  return useQuery({
    queryKey: QUERY_KEYS.bookings.list(params),
    queryFn: () => bookingApi.list(params),
    placeholderData: keepPreviousData,
  })
}

/**
 * Single booking with relationships.
 */
export function useBooking(id) {
  return useQuery({
    queryKey: QUERY_KEYS.bookings.detail(id),
    queryFn: () => bookingApi.show(id),
    enabled: Boolean(id),
  })
}

/**
 * Booking status change history.
 */
export function useBookingHistory(id) {
  return useQuery({
    queryKey: QUERY_KEYS.bookings.history(id),
    queryFn: () => bookingApi.history(id),
    enabled: Boolean(id),
  })
}

/**
 * Cancel-booking mutation.
 */
export function useCancelBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }) => bookingApi.cancel(id, reason),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Booking cancelled.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to cancel the booking.')
    },
  })
}

/**
 * Record an off-platform payment. Form errors (422/409) are left to the caller.
 */
export function useMarkBookingPaid() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, paymentReference }) => bookingApi.markPaid(id, paymentReference),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Booking marked as paid.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to mark the booking as paid.')
    },
  })
}

/**
 * Record a full or partial refund on a paid booking.
 */
export function useRefundBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, amount, reason }) => bookingApi.refund(id, amount, reason),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Refund recorded.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to record the refund.')
    },
  })
}

/**
 * Manage-dispute mutation.
 */
export function useManageDispute() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, action, resolution }) => bookingApi.manageDispute(id, action, resolution),
    onSuccess: (data) => {
      toast.success(data?.message ?? 'Dispute updated.')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bookings.all })
    },
    onError: (error) => {
      toast.error(error?.message ?? 'Unable to update the dispute.')
    },
  })
}
