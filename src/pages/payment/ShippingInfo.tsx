import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { addressService } from '@/services/address.service'
import { ETextFieldNameForKeyBoard } from '@/providers/GlobalKeyboardProvider'
import { EInternalEvents, eventEmitter } from '@/utils/events'
import {
  TClientDistrict,
  TClientProvince,
  TEndOfPaymentData,
  TKeyboardSuggestion,
} from '@/utils/types/global'
import { useKeyboardStore } from '@/stores/keyboard/keyboard.store'
import { WarningIcon } from '@/components/custom/icons/WarningIcon'
import { useQueryFilter } from '@/hooks/extensions'
import { useDebouncedCallback } from '@/hooks/use-debounce'
import { checkIfMobileScreen } from '@/utils/helpers'

type TFormErrors = {
  fullName?: string
  phone?: string
  email?: string
  province?: string
  city?: string
  ward?: string
  address?: string
}

type TSearchableItem = {
  id: string
  name: string
}

const fuzzySearchVietnamese = (items: TSearchableItem[], query: string): TSearchableItem[] => {
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')

  // Chuẩn bị keywords một lần
  const keywords: string[] = []
  for (const word of query.split(/\s+/)) {
    const normalized = normalize(word)
    if (normalized.length > 0) {
      keywords.push(normalized)
    }
  }

  if (keywords.length === 0) return items

  // Tính điểm cho từng item
  const results: Array<{ item: TSearchableItem; score: number }> = []

  for (const item of items) {
    const normalizedItem = normalize(item.name)
    let matchCount = 0

    // Đếm số từ khớp
    for (const keyword of keywords) {
      if (normalizedItem.includes(keyword)) {
        matchCount++
      }
    }

    // Chỉ thêm vào kết quả nếu có ít nhất 1 từ khớp
    if (matchCount > 0) {
      results.push({ item, score: matchCount })
    }
  }

  // Sắp xếp theo điểm giảm dần
  results.sort((a, b) => b.score - a.score)

  return results.map((result) => result.item)
}

type TSelectedLocation = {
  provinceName: string
  districtName: string
}

type TShippingInfoFormProps = {
  errors: TFormErrors
  showPaymentModal: boolean
}

export const ShippingInfoForm = forwardRef<HTMLFormElement, TShippingInfoFormProps>(
  ({ errors, showPaymentModal }, ref) => {
    const [provinces, setProvinces] = useState<TClientProvince[]>([])
    const [districts, setDistricts] = useState<TClientDistrict[]>([])
    const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null)
    const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null)
    const [selectedWardCode, setSelectedWardCode] = useState<string | null>(null)
    const [isLoadingProvinces, setIsLoadingProvinces] = useState<boolean>(false)
    const [isLoadingDistricts, setIsLoadingDistricts] = useState<boolean>(false)
    const [isLoadingWards, setIsLoadingWards] = useState<boolean>(false)

    const [suggestedProvinces, setSuggestedProvinces] = useState<TSearchableItem[]>([])
    const [suggestedDistricts, setSuggestedDistricts] = useState<TSearchableItem[]>([])
    const [suggestedWards, setSuggestedWards] = useState<TSearchableItem[]>([])

    const containerRef = useRef<HTMLDivElement>(null)

    const setTypingSuggestions = useKeyboardStore((s) => s.setSuggestions)
    const queryFilter = useQueryFilter()

    const selectedLocation = useMemo<TSelectedLocation>(() => {
      const province = provinces.find((p) => p.id === selectedProvinceId)
      const district = districts.find((d) => d.id === selectedDistrictId)
      return {
        provinceName: province ? province.name : '',
        districtName: district ? district.name : '',
      }
    }, [selectedProvinceId, selectedDistrictId])

    useEffect(() => {
      if (showPaymentModal) {
        containerRef.current?.querySelector<HTMLInputElement>('#fullName-input')?.focus()
      }
    }, [showPaymentModal])

    // Fetch provinces on mount
    useEffect(() => {
      const fetchProvinces = async () => {
        setIsLoadingProvinces(true)
        try {
          const data = await addressService.fetchProvinces()
          data.sort((a, b) => a.name.localeCompare(b.name))
          const priorityCities = ['Hà Nội', 'Đà Nẵng', 'Hồ Chí Minh']
          const priorityProvinces: typeof data = []
          const otherProvinces: typeof data = []
          for (const province of data) {
            if (priorityCities.includes(province.name)) {
              priorityProvinces.push(province)
            } else {
              otherProvinces.push(province)
            }
          }
          priorityProvinces.sort(
            (a, b) => priorityCities.indexOf(a.name) - priorityCities.indexOf(b.name)
          )
          const sortedData = [...priorityProvinces, ...otherProvinces]
          setProvinces(sortedData)
        } catch (error) {
          console.error('Failed to fetch provinces:', error)
        } finally {
          setIsLoadingProvinces(false)
        }
      }

      fetchProvinces()
      useKeyboardStore.getState().setSuggestionsLoading('fetched')
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

    const resetProvinceOnInputChange = () => {
      setSelectedProvinceId(null)
      setSelectedDistrictId(null)
      setSelectedWardCode(null)
      const districtInput = document.getElementById('city-input') as HTMLInputElement
      const wardInput = document.getElementById('ward-input') as HTMLInputElement
      if (districtInput) districtInput.value = ''
      if (wardInput) wardInput.value = ''
    }

    const resetDistrictOnInputChange = () => {
      setSelectedDistrictId(null)
      setSelectedWardCode(null)
      const wardInput = document.getElementById('ward-input') as HTMLInputElement
      if (wardInput) wardInput.value = ''
    }

    const handleProvinceChange = useDebouncedCallback(
      (inputTarget: HTMLInputElement, resetProvince?: boolean) => {
        const typedProvince = inputTarget.value
        const suggestedProvinces = fuzzySearchVietnamese(
          provinces.map((p) => ({ id: `${p.id}`, name: p.name })),
          typedProvince
        )
        if (resetProvince) resetProvinceOnInputChange()
        setSuggestedProvinces(suggestedProvinces)
        setTypingSuggestions(
          suggestedProvinces.map((province) => ({
            id: province.id,
            text: province.name,
          }))
        )
      },
      300
    )

    const handleDistrictChange = useDebouncedCallback(
      (inputTarget: HTMLInputElement, resetDistrict?: boolean) => {
        const selectedOption = inputTarget.value
        const suggestedDistricts = fuzzySearchVietnamese(
          districts.map((d) => ({ id: `${d.id}`, name: d.name })),
          selectedOption
        )
        if (resetDistrict) resetDistrictOnInputChange()
        setSuggestedDistricts(suggestedDistricts)
        setTypingSuggestions(
          suggestedDistricts.map((district) => ({
            id: district.id,
            text: district.name,
          }))
        )
      },
      300
    )

    const pickProvince = (province: TSearchableItem) => {
      const fullProvince = provinces.find((p) => p.id === parseInt(province.id))
      const input = document.getElementById('province-input') as HTMLInputElement
      if (input && fullProvince) {
        input.value = province.name
        setSelectedProvinceId(fullProvince.id)
        setSelectedDistrictId(null)
        setSelectedWardCode(null)
        setSuggestedProvinces([])
        setSuggestedDistricts([])
        setSuggestedWards([])
        // Reset district và ward
        const districtInput = document.getElementById('city-input') as HTMLInputElement
        const wardInput = document.getElementById('ward-input') as HTMLInputElement
        if (districtInput) districtInput.value = ''
        if (wardInput) wardInput.value = ''
      }
    }

    const pickDistrict = (district: TSearchableItem) => {
      const fullDistrict = districts.find((d) => d.id === parseInt(district.id))
      const input = document.getElementById('city-input') as HTMLInputElement
      if (input && fullDistrict) {
        input.value = district.name
        setSelectedDistrictId(fullDistrict.id)
        setSelectedWardCode(null)
        setSuggestedDistricts([])
        setSuggestedWards([])
        // Reset ward
        const wardInput = document.getElementById('ward-input') as HTMLInputElement
        if (wardInput) wardInput.value = ''
      }
    }

    const onProvinceFocusInput = (e: React.FocusEvent<HTMLInputElement>) => {
      handleProvinceChange(e.target)
    }

    const onDistrictFocusInput = (e: React.FocusEvent<HTMLInputElement>) => {
      handleDistrictChange(e.target)
    }

    useEffect(() => {
      const handleClickOutside = (e: PointerEvent) => {
        const target = e.target as HTMLElement
        const closestCityInput = target.closest('#city-input')
        const closestProvinceInput = target.closest('#province-input')
        const closestWardInput = target.closest('#ward-input')

        // Đóng provinces dropdown nếu click bên ngoài
        if (
          !target.closest('.NAME-provinces-suggestion') &&
          !closestProvinceInput &&
          !closestCityInput &&
          !closestWardInput
        ) {
          const value = (document.getElementById('province-input') as HTMLInputElement).value
          const found = provinces.find((p) => p.name === value)
          if (found) {
            setSelectedProvinceId(found.id)
          } else {
            setSelectedProvinceId(null)
          }
          setSuggestedProvinces([])
        }

        // Đóng districts dropdown nếu click bên ngoài
        if (
          !target.closest('.NAME-districts-suggestion') &&
          !closestCityInput &&
          !closestWardInput
        ) {
          const value = (document.getElementById('city-input') as HTMLInputElement).value
          const found = districts.find((d) => d.name === value)
          if (found) {
            setSelectedDistrictId(found.id)
          } else {
            setSelectedDistrictId(null)
          }
          setSuggestedDistricts([])
        }
      }

      document.body.addEventListener('pointerdown', handleClickOutside)

      return () => {
        document.body.removeEventListener('pointerdown', handleClickOutside)
      }
    }, [provinces, districts])

    const listenKeyboardSuggestionPicked = (suggestion: TKeyboardSuggestion, type: string) => {
      if (type === 'province') {
        pickProvince({ id: suggestion.id, name: suggestion.text })
      } else if (type === 'district') {
        pickDistrict({ id: suggestion.id, name: suggestion.text })
      }
    }

    useEffect(() => {
      eventEmitter.on(EInternalEvents.KEYBOARD_SUGGESTION_PICKED, listenKeyboardSuggestionPicked)
      return () => {
        eventEmitter.off(EInternalEvents.KEYBOARD_SUGGESTION_PICKED, listenKeyboardSuggestionPicked)
      }
    }, [provinces, districts])

    return (
      <form className="5xl:text-3xl md:text-base text-sm space-y-2" ref={ref}>
        <h3 className="5xl:text-[0.8em] 5xl:pt-8 font-semibold text-gray-900 text-lg">
          Thông tin giao hàng
        </h3>
        <div ref={containerRef} className="space-y-3">
          <div>
            <label className="5xl:text-[0.7em] block text-sm font-medium text-gray-700 mb-1">
              Họ và tên
            </label>
            <input
              id="fullName-input"
              name="fullName"
              type="text"
              placeholder="Nguyễn Văn A"
              className={`${ETextFieldNameForKeyBoard.VIRLTUAL_KEYBOARD_TEXTFIELD} 5xl:text-[0.7em] md:h-11 h-9 w-full px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-main-cl focus:border-transparent transition-all`}
            />
            {errors.fullName && (
              <p className="5xl:text-[0.6em] flex items-center gap-1 text-red-600 text-sm mt-0.5 pl-1">
                <WarningIcon className="w-4 h-4" />
                <span>{errors.fullName}</span>
              </p>
            )}
          </div>

          <div className="md:gap-3 gap-2 grid grid-cols-2">
            <div>
              <label className="5xl:text-[0.7em] block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                id="phone-input"
                name="phone"
                type="tel"
                placeholder="09xx xxx xxx"
                className={`${ETextFieldNameForKeyBoard.VIRLTUAL_KEYBOARD_TEXTFIELD} 5xl:text-[0.7em] md:h-11 h-9 w-full px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-main-cl focus:border-transparent transition-all`}
              />
              {errors.phone && (
                <p className="5xl:text-[0.6em] flex items-center gap-1 text-red-600 text-sm mt-0.5 pl-1">
                  <WarningIcon className="w-4 h-4" />
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label className="5xl:text-[0.7em] block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email-input"
                name="email"
                type="email"
                placeholder="email@domain.com"
                className={`${ETextFieldNameForKeyBoard.VIRLTUAL_KEYBOARD_TEXTFIELD} 5xl:text-[0.7em] md:h-11 h-9 w-full px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-main-cl focus:border-transparent transition-all`}
              />
              {errors.email && (
                <p className="5xl:text-[0.6em] flex items-center gap-1 text-red-600 text-sm mt-0.5 pl-1">
                  <WarningIcon className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          <div className="md:gap-3 gap-2 grid grid-cols-2">
            <div className="relative">
              <label className="5xl:text-[0.7em] block text-sm font-medium text-gray-700 mb-1">
                Tỉnh/Thành phố
              </label>
              <input
                type="text"
                name="province"
                value={selectedLocation.provinceName}
                readOnly
                className="hidden"
              />
              <input
                id="province-input"
                type="text"
                onChange={(e) => handleProvinceChange(e.target, true)}
                onFocus={onProvinceFocusInput}
                placeholder={isLoadingProvinces ? 'Đang tải...' : 'Nhập tên tỉnh/thành phố'}
                className={`${ETextFieldNameForKeyBoard.VIRLTUAL_KEYBOARD_TEXTFIELD} NAME-province 5xl:text-[0.7em] md:h-11 h-9 w-full px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-main-cl focus:border-transparent transition-all`}
                disabled={isLoadingProvinces}
                autoComplete="off"
              />
              {(queryFilter.isPhotoism ? checkIfMobileScreen() : true) &&
                suggestedProvinces.length > 0 && (
                  <ul className="NAME-provinces-suggestion STYLE-styled-scrollbar absolute z-50 w-full bg-white border border-gray-300 rounded-xl mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {suggestedProvinces.map((province) => {
                      return (
                        <li
                          key={province.id}
                          onClick={() => pickProvince(province)}
                          className="px-4 py-2 hover:bg-main-cl hover:text-white cursor-pointer transition-colors text-sm"
                        >
                          {province.name}
                        </li>
                      )
                    })}
                  </ul>
                )}
              {errors.province && (
                <p className="5xl:text-[0.6em] flex items-center gap-1 text-red-600 text-sm mt-0.5 pl-1">
                  <WarningIcon className="w-4 h-4" />
                  {errors.province}
                </p>
              )}
            </div>

            <div
              className={`relative ${selectedProvinceId ? '' : 'pointer-events-none opacity-60'}`}
            >
              <label className="5xl:text-[0.7em] block text-sm font-medium text-gray-700 mb-1">
                Quận/Huyện
              </label>
              <input
                type="text"
                name="city"
                value={selectedLocation.districtName}
                readOnly
                className="hidden"
              />
              <input
                id="city-input"
                type="text"
                onChange={(e) => handleDistrictChange(e.target, true)}
                onFocus={onDistrictFocusInput}
                placeholder={
                  !selectedProvinceId
                    ? 'Chọn tỉnh/thành phố trước'
                    : isLoadingDistricts
                    ? 'Đang tải...'
                    : 'Nhập tên quận/huyện'
                }
                className={`${ETextFieldNameForKeyBoard.VIRLTUAL_KEYBOARD_TEXTFIELD} NAME-district 5xl:text-[0.7em] md:h-11 h-9 w-full px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-main-cl focus:border-transparent transition-all`}
                disabled={!selectedProvinceId || isLoadingDistricts}
                autoComplete="off"
              />
              {(queryFilter.isPhotoism ? checkIfMobileScreen() : true) &&
                suggestedDistricts.length > 0 && (
                  <ul className="NAME-districts-suggestion STYLE-styled-scrollbar absolute z-50 w-full bg-white border border-gray-300 rounded-xl mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {suggestedDistricts.map((district) => {
                      return (
                        <li
                          key={district.id}
                          onClick={() => pickDistrict(district)}
                          className="px-4 py-2 hover:bg-main-cl hover:text-white cursor-pointer transition-colors text-sm"
                        >
                          {district.name}
                        </li>
                      )
                    })}
                  </ul>
                )}
              {errors.city && (
                <p className="5xl:text-[0.6em] flex items-center gap-1 text-red-600 text-sm mt-0.5 pl-1">
                  <WarningIcon className="w-4 h-4" />
                  {errors.city}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="5xl:text-[0.7em] block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ chi tiết
            </label>
            <input
              id="address-input"
              name="address"
              type="text"
              placeholder="Số nhà, tên đường, phường/xã..."
              className={`${ETextFieldNameForKeyBoard.VIRLTUAL_KEYBOARD_TEXTFIELD} 5xl:text-[0.7em] md:h-11 h-9 w-full px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-main-cl focus:border-transparent transition-all`}
            />
            {errors.address && (
              <p className="5xl:text-[0.6em] flex items-center gap-1 text-red-600 text-sm mt-0.5 pl-1">
                <WarningIcon className="w-4 h-4" />
                {errors.address}
              </p>
            )}
          </div>

          <div>
            <label className="5xl:text-[0.7em] block text-sm font-medium text-gray-700 mb-1">
              Lời nhắn (tùy chọn)
            </label>
            <textarea
              id="message-input"
              name="message"
              placeholder="Nhập lời nhắn của bạn..."
              rows={2}
              className={`${ETextFieldNameForKeyBoard.VIRLTUAL_KEYBOARD_TEXTFIELD} 5xl:text-[0.7em] py-2 w-full px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-main-cl focus:border-transparent transition-all`}
            ></textarea>
          </div>
        </div>
      </form>
    )
  }
)

export type { TFormErrors }
