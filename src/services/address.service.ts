import {
  getFetchProvinces,
  getFetchDistricts,
  getFetchWards,
  getVietmapAutocomplete,
} from './api/address.api'
import { AddressAdapter } from './adapter/address.adapter'
import {
  TClientLocationResult,
  TClientDistrict,
  TClientProvince,
  TClientWard,
} from '@/utils/types/global'

class AddressService {
  constructor() {}

  async fetchProvinces(): Promise<TClientProvince[]> {
    const response = await getFetchProvinces()
    const apiProvinces = response.data?.data || []
    return AddressAdapter.toClientProvinces(apiProvinces)
  }

  async fetchDistricts(provinceId: number): Promise<TClientDistrict[]> {
    const response = await getFetchDistricts(provinceId)
    const apiDistricts = response.data?.data || []
    return AddressAdapter.toClientDistricts(apiDistricts)
  }

  async fetchWards(districtId: number): Promise<TClientWard[]> {
    const response = await getFetchWards(districtId)
    const apiWards = response.data?.data || []
    return AddressAdapter.toClientWards(apiWards)
  }

  async autocompleteAddress(text: string): Promise<TClientLocationResult[]> {
    try {
      // Vietmap API trả về array trực tiếp, không có wrapper
      const locations = await getVietmapAutocomplete(text, 2)
      return AddressAdapter.toClientLocations(locations)
    } catch (error) {
      console.error('>>> Error fetching autocomplete:', error)
      return []
    }
  }
}

export const addressService = new AddressService()
