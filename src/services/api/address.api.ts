import { apiClient } from './api-client'
import {
  TAddressProvince,
  TAddressDistrict,
  TAddressWard,
  TApiResponseBody,
} from '@/utils/types/api'

export const getFetchProvinces = () =>
  apiClient.get<TApiResponseBody<TAddressProvince[]>>('/locations/provinces')

export const getFetchDistricts = (provinceId: number) =>
  apiClient.get<TApiResponseBody<TAddressDistrict[]>>(
    `/locations/districts?province_id=${provinceId}`
  )

export const getFetchWards = (districtId: number) =>
  apiClient.get<TApiResponseBody<TAddressWard[]>>(`/locations/wards?district_id=${districtId}`)

// Vietmap autocomplete API

export const getVietmapAutocomplete = (text: string) => {
  const encodedText = encodeURIComponent(text)
  return fetch(
    `https://maps.vietmap.vn/api/autocomplete/v4?apikey=${''}&text=${encodedText}&display_type=2`
  ).then((res) => res.json())
}
