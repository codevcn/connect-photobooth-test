import { apiClient } from './api-client'
import {
  TAddressProvince,
  TAddressDistrict,
  TAddressWard,
  TApiResponseBody,
  TGoongAutocompleteResponse,
  TGoongPrediction,
  TLatLongLocation,
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

// Goong API key - thay bằng key của bạn
const GOONG_API_KEY = 'O0uveyvP5oAAPwWSND4y1wgvOqsfwQWGAHD69CSo'
export const getGoongAutocomplete = async (
  text: string,
  location?: TLatLongLocation
): Promise<TGoongPrediction[]> => {
  const encodedInput = encodeURIComponent(text)
  let url = `https://rsapi.goong.io/Place/AutoComplete?api_key=${GOONG_API_KEY}&input=${encodedInput}`

  // Thêm location bias nếu có (giúp gợi ý địa chỉ chính xác hơn trong khu vực)
  if (location) {
    url += `&location=${location.lat},${location.lng}&radius=5000`
  }

  const response = await fetch(url)
  const data = (await response.json()) as TGoongAutocompleteResponse

  if (data.status === 'OK') {
    return data.predictions
  }
  return []
}
