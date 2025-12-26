import { TAddressProvince, TAddressDistrict, TAddressWard, TAddressResult } from '@/utils/types/api'
import {
  TClientLocationResult,
  TClientDistrict,
  TClientProvince,
  TClientWard,
} from '@/utils/types/global'

/**
 * AddressAdapter - Chuyển đổi dữ liệu địa chỉ từ API sang cấu trúc Client
 */
export class AddressAdapter {
  /**
   * Convert TAddressProvince sang TClientProvince
   */
  static toClientProvince(apiProvince: TAddressProvince): TClientProvince {
    return {
      id: apiProvince.id,
      name: apiProvince.name,
      districtCount: apiProvince.district_count,
    }
  }

  /**
   * Convert TAddressProvince[] sang TClientProvince[]
   */
  static toClientProvinces(apiProvinces: TAddressProvince[]): TClientProvince[] {
    return apiProvinces.map((province) => this.toClientProvince(province))
  }

  /**
   * Convert TAddressDistrict sang TClientDistrict
   */
  static toClientDistrict(apiDistrict: TAddressDistrict): TClientDistrict {
    return {
      id: apiDistrict.id,
      name: apiDistrict.name,
      provinceId: apiDistrict.province_id,
      wardCount: apiDistrict.ward_count,
    }
  }

  /**
   * Convert TAddressDistrict[] sang TClientDistrict[]
   */
  static toClientDistricts(apiDistricts: TAddressDistrict[]): TClientDistrict[] {
    return apiDistricts.map((district) => this.toClientDistrict(district))
  }

  /**
   * Convert TAddressWard sang TClientWard
   */
  static toClientWard(apiWard: TAddressWard): TClientWard {
    return {
      code: apiWard.code,
      name: apiWard.name,
      districtId: apiWard.district_id,
      provinceId: apiWard.province_id,
    }
  }

  /**
   * Convert TAddressWard[] sang TClientWard[]
   */
  static toClientWards(apiWards: TAddressWard[]): TClientWard[] {
    return apiWards.map((ward) => this.toClientWard(ward))
  }

  /**
   * Format address string từ các thành phần
   */
  static formatFullAddress(
    address1: string,
    ward?: TClientWard | null,
    district?: TClientDistrict | null,
    province?: TClientProvince | null
  ): string {
    const parts = [address1]

    if (ward) parts.push(ward.name)
    if (district) parts.push(district.name)
    if (province) parts.push(province.name)

    return parts.filter(Boolean).join(', ')
  }

  /**
   * Tìm province theo ID
   */
  static findProvinceById(provinces: TClientProvince[], id: number): TClientProvince | undefined {
    return provinces.find((p) => p.id === id)
  }

  /**
   * Tìm district theo ID
   */
  static findDistrictById(districts: TClientDistrict[], id: number): TClientDistrict | undefined {
    return districts.find((d) => d.id === id)
  }

  /**
   * Tìm ward theo code
   */
  static findWardByCode(wards: TClientWard[], code: string): TClientWard | undefined {
    return wards.find((w) => w.code === code)
  }

  static toClientLocations(locations: TAddressResult[]): TClientLocationResult[] {
    return locations.map((location) => this.toClientLocation(location))
  }

  static toClientLocation(location: TAddressResult): TClientLocationResult {
    return {
      refId: location.ref_id,
      distance: location.distance,
      address: location.address,
      name: location.name,
      display: location.display,
      boundaries: location.boundaries.map((b) => ({
        name: b.name,
        prefix: b.prefix,
        fullName: b.full_name,
        id: b.id,
        type: b.type,
      })),
      categories: location.categories,
      entryPoints: location.entry_points,
    }
  }
}
