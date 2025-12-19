import { apiClient } from './api-client'
import { TApiResponseBody, TCheckVoucherReq, TCheckVoucherRes } from '@/utils/types/api'

export const postCheckVoucher = (data: TCheckVoucherReq) =>
  apiClient.post<TApiResponseBody<TCheckVoucherRes>, TCheckVoucherReq>('/vouchers/check', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
