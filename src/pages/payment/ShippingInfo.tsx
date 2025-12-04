import { forwardRef, useEffect, useState } from 'react'
import { addressService } from '@/services/address.service'
import { TClientDistrict, TClientProvince, TClientWard } from '@/services/adapter/address.adapter'

type TFormErrors = {
  fullName?: string
  phone?: string
  email?: string
  province?: string
  city?: string
  address?: string
}

interface ShippingInfoFormProps {
  errors: TFormErrors
}

export const ShippingInfoForm = forwardRef<HTMLFormElement, ShippingInfoFormProps>(
  ({ errors }, ref) => {
    const [provinces, setProvinces] = useState<TClientProvince[]>([])
    const [districts, setDistricts] = useState<TClientDistrict[]>([])
    const [wards, setWards] = useState<TClientWard[]>([])
    const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null)
    const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null)
    const [isLoadingProvinces, setIsLoadingProvinces] = useState<boolean>(false)
    const [isLoadingDistricts, setIsLoadingDistricts] = useState<boolean>(false)
    const [isLoadingWards, setIsLoadingWards] = useState<boolean>(false)

    // Fetch provinces on mount
    useEffect(() => {
      const fetchProvinces = async () => {
        setIsLoadingProvinces(true)
        try {
          const data = await addressService.fetchProvinces()
          setProvinces(data)
        } catch (error) {
          console.error('Failed to fetch provinces:', error)
        } finally {
          setIsLoadingProvinces(false)
        }
      }

      fetchProvinces()
    }, [])

    // Fetch districts when province changes
    useEffect(() => {
      if (!selectedProvinceId) {
        setDistricts([])
        return
      }

      const fetchDistricts = async () => {
        setIsLoadingDistricts(true)
        try {
          const data = await addressService.fetchDistricts(selectedProvinceId)
          setDistricts(data)
        } catch (error) {
          console.error('Failed to fetch districts:', error)
          setDistricts([])
        } finally {
          setIsLoadingDistricts(false)
        }
      }

      fetchDistricts()
    }, [selectedProvinceId])

    // Fetch wards when district changes
    useEffect(() => {
      if (!selectedDistrictId) {
        setWards([])
        return
      }

      const fetchWards = async () => {
        setIsLoadingWards(true)
        try {
          const data = await addressService.fetchWards(selectedDistrictId)
          setWards(data)
        } catch (error) {
          console.error('Failed to fetch wards:', error)
          setWards([])
        } finally {
          setIsLoadingWards(false)
        }
      }

      fetchWards()
    }, [selectedDistrictId])

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedOption = e.target.options[e.target.selectedIndex]
      const provinceId = selectedOption.dataset.provinceId

      if (provinceId) {
        setSelectedProvinceId(Number(provinceId))
      } else {
        setSelectedProvinceId(null)
      }

      // Reset district and ward selection
      setSelectedDistrictId(null)
      const districtSelect = document.getElementById('city-input') as HTMLSelectElement
      const wardSelect = document.getElementById('ward-input') as HTMLSelectElement
      if (districtSelect) {
        districtSelect.value = ''
      }
      if (wardSelect) {
        wardSelect.value = ''
      }
    }

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedOption = e.target.options[e.target.selectedIndex]
      const districtId = selectedOption.dataset.districtId

      if (districtId) {
        setSelectedDistrictId(Number(districtId))
      } else {
        setSelectedDistrictId(null)
      }

      // Reset ward selection
      const wardSelect = document.getElementById('ward-input') as HTMLSelectElement
      if (wardSelect) {
        wardSelect.value = ''
      }
    }

    return (
      <form className="3xl:text-3xl md:text-base text-sm space-y-2" ref={ref}>
        <h3 className="3xl:text-[0.8em] font-semibold text-gray-900 text-lg">
          Thông tin giao hàng
        </h3>
        <div className="space-y-3">
          <div>
            <label
              htmlFor="fullName-input"
              className="3xl:text-[0.7em] block text-sm font-medium text-gray-700 mb-1"
            >
              Họ và tên
            </label>
            <input
              id="fullName-input"
              name="fullName"
              type="text"
              placeholder="Nguyễn Văn A"
              className="3xl:text-[0.7em] md:h-11 h-9 w-full px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-main-cl focus:border-transparent transition-all"
            />
            {errors.fullName && (
              <p className="3xl:text-[0.6em] text-red-600 text-sm mt-0.5 pl-1">{errors.fullName}</p>
            )}
          </div>

          <div className="md:gap-3 gap-2 grid grid-cols-2">
            <div>
              <label
                htmlFor="phone-input"
                className="3xl:text-[0.7em] block text-sm font-medium text-gray-700 mb-1"
              >
                Số điện thoại
              </label>
              <input
                id="phone-input"
                name="phone"
                type="tel"
                placeholder="09xx xxx xxx"
                className="3xl:text-[0.7em] md:h-11 h-9 w-full px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-main-cl focus:border-transparent transition-all"
              />
              {errors.phone && (
                <p className="3xl:text-[0.6em] text-red-600 text-sm mt-0.5 pl-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email-input"
                className="3xl:text-[0.7em] block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email-input"
                name="email"
                type="email"
                placeholder="email@domain.com"
                className="3xl:text-[0.7em] md:h-11 h-9 w-full px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-main-cl focus:border-transparent transition-all"
              />
              {errors.email && (
                <p className="3xl:text-[0.6em] text-red-600 text-sm mt-0.5 pl-1">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="md:gap-3 gap-2 grid grid-cols-2">
            <div>
              <label
                htmlFor="province-input"
                className="3xl:text-[0.7em] block text-sm font-medium text-gray-700 mb-1"
              >
                Tỉnh/Thành phố
              </label>
              <select
                id="province-input"
                name="province"
                onChange={handleProvinceChange}
                className="3xl:text-[0.7em] md:h-11 h-9 w-full px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-main-cl focus:border-transparent transition-all bg-white"
                disabled={isLoadingProvinces}
              >
                <option value="">
                  {isLoadingProvinces ? 'Đang tải...' : 'Chọn tỉnh/thành phố'}
                </option>
                {provinces.map((province) => (
                  <option key={province.id} value={province.name} data-province-id={province.id}>
                    {province.name}
                  </option>
                ))}
              </select>
              {errors.province && (
                <p className="3xl:text-[0.6em] text-red-600 text-sm mt-0.5 pl-1">
                  {errors.province}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="city-input"
                className="3xl:text-[0.7em] block text-sm font-medium text-gray-700 mb-1"
              >
                Quận/Huyện
              </label>
              <select
                id="city-input"
                name="city"
                onChange={handleDistrictChange}
                className="3xl:text-[0.7em] md:h-11 h-9 w-full px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-main-cl focus:border-transparent transition-all bg-white"
                disabled={!selectedProvinceId || isLoadingDistricts}
              >
                <option value="">
                  {!selectedProvinceId
                    ? 'Chọn tỉnh/thành phố trước'
                    : isLoadingDistricts
                    ? 'Đang tải...'
                    : 'Chọn quận/huyện'}
                </option>
                {districts.map((district) => (
                  <option key={district.id} value={district.name} data-district-id={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
              {errors.city && (
                <p className="3xl:text-[0.6em] text-red-600 text-sm mt-0.5 pl-1">{errors.city}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="ward-input"
              className="3xl:text-[0.7em] block text-sm font-medium text-gray-700 mb-1"
            >
              Phường/Xã
            </label>
            <select
              id="ward-input"
              name="ward"
              className="3xl:text-[0.7em] md:h-11 h-9 w-full px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-main-cl focus:border-transparent transition-all bg-white"
              disabled={!selectedDistrictId || isLoadingWards}
            >
              <option value="">
                {!selectedDistrictId
                  ? 'Chọn quận/huyện trước'
                  : isLoadingWards
                  ? 'Đang tải...'
                  : 'Chọn phường/xã'}
              </option>
              {wards.map((ward) => (
                <option key={ward.code} value={ward.name}>
                  {ward.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="address-input"
              className="3xl:text-[0.7em] block text-sm font-medium text-gray-700 mb-1"
            >
              Địa chỉ chi tiết
            </label>
            <input
              id="address-input"
              name="address"
              type="text"
              placeholder="Số nhà, tên đường, phường/xã..."
              className="3xl:text-[0.7em] md:h-11 h-9 w-full px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-main-cl focus:border-transparent transition-all"
            />
            {errors.address && (
              <p className="3xl:text-[0.6em] text-red-600 text-sm mt-0.5 pl-1">{errors.address}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="message-input"
              className="3xl:text-[0.7em] block text-sm font-medium text-gray-700 mb-1"
            >
              Lời nhắn (tùy chọn)
            </label>
            <textarea
              id="message-input"
              name="message"
              placeholder="Nhập lời nhắn của bạn..."
              rows={2}
              className="3xl:text-[0.7em] py-2 w-full px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-main-cl focus:border-transparent transition-all"
            ></textarea>
          </div>
        </div>
      </form>
    )
  }
)

export type { TFormErrors }
