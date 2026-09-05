import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '../../../constants'
import { auditApi } from '../api/auditApi'

export function useAuditLogs(params) {
  return useQuery({
    queryKey: QUERY_KEYS.audit.list(params),
    queryFn: () => auditApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useAuditAdministrators() {
  return useQuery({
    queryKey: QUERY_KEYS.audit.administrators,
    queryFn: auditApi.administrators,
    staleTime: 300_000,
  })
}
