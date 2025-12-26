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
const VIETMAP_API_KEY = '44407a50f3fe8cac581ee97d7d181246e6c18ee0d33a2c44'
export const getVietmapAutocomplete = (text: string, displayType: number) => {
  const encodedText = encodeURIComponent(text)
  return fetch(
    `https://maps.vietmap.vn/api/autocomplete/v4?apikey=${VIETMAP_API_KEY}&text=${encodedText}&display_type=${displayType}`
  ).then((res) => res.json())
}
