import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { addressService } from '@/services/address.service'
import { ETextFieldNameForKeyBoard } from '@/providers/GlobalKeyboardProvider'
import { EInternalEvents, eventEmitter } from '@/utils/events'
import { TClientLocationResult, TEndOfPaymentData, TKeyboardSuggestion } from '@/utils/types/global'
import { useKeyboardStore } from '@/stores/keyboard/keyboard.store'
import { WarningIcon } from '@/components/custom/icons/WarningIcon'
import { useQueryFilter } from '@/hooks/extensions'
import { useDebouncedCallback } from '@/hooks/use-debounce'
import { ELocationBoudaryType } from '@/utils/enums'
import { toast } from 'react-toastify'

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

const normalizeString = (str: string) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')

const fuzzySearchVietnamese = (items: TSearchableItem[], query: string): TSearchableItem[] => {
  const normalizeString = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')

  // Chuẩn bị keywords một lần
  const keywords: string[] = []
  for (const word of query.split(/\s+/)) {
    const normalized = normalizeString(word)
    if (normalized.length > 0) {
      keywords.push(normalized)
    }
  }

  if (keywords.length === 0) return items

  // Tính điểm cho từng item
  const results: Array<{ item: TSearchableItem; score: number }> = []

  for (const item of items) {
    const normalizedItem = normalizeString(item.name)
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

const normalizeAddressString = (address: TClientLocationResult['address']) =>
  address.replace(/,/g, ', ')

const getFullAddress = (location: TClientLocationResult) => {
  return `${location.name}, ${normalizeAddressString(location.address)}.`
}

const sortLocationsResultByKeyword = (
  locations: TClientLocationResult[],
  query: string
): TSortedLocation[] => {
  const bestMatchedLocations: TSortedLocation[] = []
  const keyword: string[] = []
  for (const word of query.split(/\s+/)) {
    const normalized = normalizeString(word)
    if (normalized.length > 0) {
      keyword.push(normalized)
    }
  }
  for (const location of locations) {
    const locationToCompare = normalizeString(getFullAddress(location))
    let currentMatchPoint = 0
    for (const word of keyword) {
      if (locationToCompare.includes(word)) {
        currentMatchPoint += 1
      }
    }
    bestMatchedLocations.push({ ...location, matchPoint: currentMatchPoint })
  }
  bestMatchedLocations.sort((a, b) => b.matchPoint - a.matchPoint)
  return bestMatchedLocations
}

type TSelectedLocationData = {
  province: string
  district: string
  ward: string
}

type TSortedLocation = TClientLocationResult & {
  matchPoint: number
}

type TShippingInfoFormProps = {
  errors: TFormErrors
  showPaymentModal: boolean
}

export const ShippingInfoForm = forwardRef<HTMLFormElement, TShippingInfoFormProps>(
  ({ errors, showPaymentModal }, ref) => {
    const [locations, setLocations] = useState<TClientLocationResult[]>([])
    const [selectedLocation, setSelectedLocation] = useState<TClientLocationResult | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const setTypingSuggestions = useKeyboardStore((s) => s.setSuggestions)
    const queryFilter = useQueryFilter()
    const keywordRef = useRef<string>('')

    const selectedLocationData = useMemo<TSelectedLocationData>(() => {
      if (selectedLocation) {
        return {
          province:
            selectedLocation.boundaries.find((b) => b.type === ELocationBoudaryType.PROVINCE)
              ?.name || '',
          district:
            selectedLocation.boundaries.find((b) => b.type === ELocationBoudaryType.DISTRICT)
              ?.name || '',
          ward:
            selectedLocation.boundaries.find((b) => b.type === ELocationBoudaryType.WARD)?.name ||
            '',
        }
      }
      return { province: '', district: '', ward: '' }
    }, [selectedLocation])

    const searchAddress = useDebouncedCallback(async (keyword: string) => {
      if (keyword.trim().length === 0) {
        setLocations([])
        setTypingSuggestions([])
        return
      }
      keywordRef.current = keyword
      let locations: TClientLocationResult[] = []
      try {
        locations = await addressService.autocompleteAddress(keyword)
      } catch (error) {
        console.error('>>> Error searching address:', error)
        toast.error('Đã có lỗi xảy ra khi tìm kiếm địa chỉ')
      }
      if (locations.length === 0) {
        setTypingSuggestions([])
        setLocations([])
        return
      }
      locations = sortLocationsResultByKeyword(locations, keyword)
      setLocations(locations)
      setTypingSuggestions(
        locations.map((loc) => ({
          id: loc.refId,
          text: getFullAddress(loc),
        }))
      )
    }, 300)

    const cleanOverlapKeyword = (fullAddress: string, keyword: string) => {
      const words = keyword.trim().toLowerCase().split(/\s+/)
      const lowerFullAddress = fullAddress.toLowerCase()
      let index = 0
      for (const word of words) {
        if (word.trim().length === 0) continue
        if (lowerFullAddress.includes(word)) {
          words[index] = ''
        }
        index++
      }
      return words.join(' ').trim()
    }

    const setTextFieldValue = (addressTextFieldElement: HTMLInputElement) => {
      if (!selectedLocation) return
      const currentKeyword = keywordRef.current
      if (!currentKeyword || currentKeyword.trim().length === 0) return
      const fullAddress = getFullAddress(selectedLocation)
      const displayedText = `${cleanOverlapKeyword(fullAddress, currentKeyword)} ${fullAddress}`
      addressTextFieldElement.value = displayedText.trim()
      const len = addressTextFieldElement.value.length
      addressTextFieldElement.focus()
      addressTextFieldElement.setSelectionRange(len, len)
    }

    const pickLocation = (locationRefId: TClientLocationResult['refId']) => {
      const selectedLocation = locations.find((loc) => loc.refId === locationRefId) || null
      setSelectedLocation(selectedLocation)
      if (selectedLocation) {
        const addressInput = containerRef.current?.querySelector<HTMLInputElement>('#address-input')
        if (addressInput) {
          setTextFieldValue(addressInput)
        }
      }
      setLocations([])
      setTypingSuggestions([])
    }

    const listenKeyboardSuggestionPicked = (suggestion: TKeyboardSuggestion, _type: string) => {
      pickLocation(suggestion.id)
    }

    useEffect(() => {
      if (showPaymentModal) {
        containerRef.current?.querySelector<HTMLInputElement>('#fullName-input')?.focus()
      }
    }, [showPaymentModal])

    useEffect(() => {
      eventEmitter.on(EInternalEvents.KEYBOARD_SUGGESTION_PICKED, listenKeyboardSuggestionPicked)
      return () => {
        eventEmitter.off(EInternalEvents.KEYBOARD_SUGGESTION_PICKED, listenKeyboardSuggestionPicked)
      }
    }, [locations])

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
            <input
              id="province-input"
              name="province"
              className="hidden"
              value={selectedLocationData.province}
              readOnly
            />
            <input
              id="district-input"
              name="district"
              className="hidden"
              value={selectedLocationData.district}
              readOnly
            />
            <input
              id="ward-input"
              name="ward"
              className="hidden"
              value={selectedLocationData.ward}
              readOnly
            />
            <div className="col-span-2 relative">
              <label className="5xl:text-[0.7em] block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ nhận hàng của bạn
              </label>
              <input
                id="address-input"
                name="address"
                type="text"
                onChange={(e) => searchAddress(e.target.value)}
                placeholder={
                  queryFilter.isPhotoism
                    ? '766 Sư Vạn Hạnh, phường 12, quận 10, thành phố Hồ Chí Minh'
                    : queryFilter.funId
                    ? '70 Hoàng Diệu 2, Linh Chiểu, Thủ Đức, thành phố Hồ Chí Minh'
                    : '125 Nguyễn Văn Tiên, Tân Phong, thành phố Biên Hòa, tỉnh Đồng Nai'
                }
                className={`${ETextFieldNameForKeyBoard.VIRLTUAL_KEYBOARD_TEXTFIELD} 5xl:text-[0.7em] md:h-11 h-9 w-full px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-main-cl focus:border-transparent transition-all`}
              />
              {errors.address && (
                <p className="5xl:text-[0.6em] flex items-center gap-1 text-red-600 text-sm mt-0.5 pl-1">
                  <WarningIcon className="w-4 h-4" />
                  {errors.address}
                </p>
              )}

              {!queryFilter.isPhotoism && locations.length > 0 && (
                <ul className="NAME-provinces-suggestion top-[calc(100%+0.25rem)] left-0 absolute z-50 w-full bg-white border border-gray-300 rounded-xl mt-1 max-h-60 overflow-y-auto shadow-lg">
                  {locations.map((location) => {
                    return (
                      <li
                        key={location.refId}
                        onClick={() => pickLocation(location.refId)}
                        className="px-4 py-2 hover:bg-main-cl hover:text-white cursor-pointer transition-colors text-sm"
                      >
                        <div className="font-bold mb-1">{location.name}</div>
                        <div className="text-[13px] mb-1">
                          {location.address?.replace(/,/g, ', ')}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
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
