import { useState, useCallback, useRef } from 'react'

// Goong API key - thay bằng key của bạn
const GOONG_API_KEY = 'O0uveyvP5oAAPwWSND4y1wgvOqsfwQWGAHD69CSo'

type TGoongPrediction = {
  description: string
  place_id: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
  compound: {
    commune?: string
    district?: string
    province?: string
  }
}

type TGoongAutocompleteResponse = {
  predictions: TGoongPrediction[]
  status: string
}

// Debounce hook
const useDebounce = (callback: (...args: any[]) => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  return useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  )
}

// Goong Autocomplete API
const goongAutocomplete = async (input: string): Promise<TGoongPrediction[]> => {
  if (!input.trim()) return []

  try {
    const encodedInput = encodeURIComponent(input)
    const response = await fetch(
      `https://rsapi.goong.io/Place/AutoComplete?api_key=${GOONG_API_KEY}&input=${encodedInput}`
    )
    const data: TGoongAutocompleteResponse = await response.json()

    if (data.status === 'OK') {
      return data.predictions
    }
    return []
  } catch (error) {
    console.error('Goong API Error:', error)
    return []
  }
}

// Goong Autocomplete với location bias (cho địa chỉ chi tiết)
const goongAutocompleteWithLocation = async (
  input: string,
  location?: { lat: number; lng: number }
): Promise<TGoongPrediction[]> => {
  if (!input.trim()) return []

  try {
    const encodedInput = encodeURIComponent(input)
    let url = `https://rsapi.goong.io/Place/AutoComplete?api_key=${GOONG_API_KEY}&input=${encodedInput}`

    // Thêm location bias nếu có (giúp gợi ý địa chỉ chính xác hơn trong khu vực)
    if (location) {
      url += `&location=${location.lat},${location.lng}&radius=5000`
    }

    const response = await fetch(url)
    const data: TGoongAutocompleteResponse = await response.json()

    if (data.status === 'OK') {
      return data.predictions
    }
    return []
  } catch (error) {
    console.error('Goong API Error:', error)
    return []
  }
}

export const GoongAutocompleteTest = () => {
  // State cho input Tỉnh/Quận/Huyện
  const [provinceInput, setProvinceInput] = useState('')
  const [provinceSuggestions, setProvinceSuggestions] = useState<TGoongPrediction[]>([])
  const [selectedProvince, setSelectedProvince] = useState<TGoongPrediction | null>(null)
  const [loadingProvince, setLoadingProvince] = useState(false)

  // State cho input Địa chỉ chi tiết
  const [addressInput, setAddressInput] = useState('')
  const [addressSuggestions, setAddressSuggestions] = useState<TGoongPrediction[]>([])
  const [selectedAddress, setSelectedAddress] = useState<TGoongPrediction | null>(null)
  const [loadingAddress, setLoadingAddress] = useState(false)

  // Debounced search cho Tỉnh/Quận/Huyện
  const searchProvince = useDebounce(async (keyword: string) => {
    if (!keyword.trim()) {
      setProvinceSuggestions([])
      return
    }

    setLoadingProvince(true)
    try {
      const results = await goongAutocomplete(keyword)
      setProvinceSuggestions(results)
    } finally {
      setLoadingProvince(false)
    }
  }, 200)

  // Debounced search cho Địa chỉ chi tiết
  const searchAddress = useDebounce(async (keyword: string) => {
    if (!keyword.trim()) {
      setAddressSuggestions([])
      return
    }

    setLoadingAddress(true)
    try {
      // Có thể truyền location từ selectedProvince nếu có
      const results = await goongAutocompleteWithLocation(keyword)
      setAddressSuggestions(results)
    } finally {
      setLoadingAddress(false)
    }
  }, 200)

  // Handle province input change
  const handleProvinceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setProvinceInput(value)
    setSelectedProvince(null)
    searchProvince(value)
  }

  // Handle address input change
  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAddressInput(value)
    setSelectedAddress(null)
    searchAddress(value)
  }

  // Select province
  const handleSelectProvince = (prediction: TGoongPrediction) => {
    setSelectedProvince(prediction)
    setProvinceInput(prediction.description)
    setProvinceSuggestions([])
  }

  // Select address
  const handleSelectAddress = (prediction: TGoongPrediction) => {
    setSelectedAddress(prediction)
    setAddressInput(prediction.description)
    setAddressSuggestions([])
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Test Goong Autocomplete API</h1>

      {/* Input 1: Tỉnh / Quận / Huyện */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Tỉnh / Thành phố, Quận / Huyện, Phường / Xã
        </label>
        <div className="relative">
          <input
            type="text"
            value={provinceInput}
            onChange={handleProvinceInputChange}
            placeholder="Nhập địa chỉ (VD: Quận 1, Hồ Chí Minh)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {loadingProvince && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Dropdown suggestions */}
          {provinceSuggestions.length > 0 && (
            <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {provinceSuggestions.map((prediction) => (
                <li
                  key={prediction.place_id}
                  onClick={() => handleSelectProvince(prediction)}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">
                    {prediction.structured_formatting.main_text}
                  </div>
                  <div className="text-sm text-gray-500">
                    {prediction.structured_formatting.secondary_text}
                  </div>
                  {prediction.compound && (
                    <div className="text-xs text-gray-400 mt-1">
                      {[
                        prediction.compound.commune,
                        prediction.compound.district,
                        prediction.compound.province,
                      ]
                        .filter(Boolean)
                        .join(' • ')}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Selected province info */}
        {selectedProvince && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm font-medium text-green-800">Đã chọn:</div>
            <div className="text-sm text-green-700">{selectedProvince.description}</div>
            <div className="text-xs text-green-600 mt-1">Place ID: {selectedProvince.place_id}</div>
          </div>
        )}
      </div>

      {/* Input 2: Địa chỉ chi tiết (số nhà, đường) */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Địa chỉ chi tiết (Số nhà, Tên đường)
        </label>
        <div className="relative">
          <input
            type="text"
            value={addressInput}
            onChange={handleAddressInputChange}
            placeholder="Nhập số nhà, tên đường (VD: 123 Nguyễn Huệ)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {loadingAddress && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Dropdown suggestions */}
          {addressSuggestions.length > 0 && (
            <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {addressSuggestions.map((prediction) => (
                <li
                  key={prediction.place_id}
                  onClick={() => handleSelectAddress(prediction)}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">
                    {prediction.structured_formatting.main_text}
                  </div>
                  <div className="text-sm text-gray-500">
                    {prediction.structured_formatting.secondary_text}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Selected address info */}
        {selectedAddress && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm font-medium text-blue-800">Đã chọn:</div>
            <div className="text-sm text-blue-700">{selectedAddress.description}</div>
            <div className="text-xs text-blue-600 mt-1">Place ID: {selectedAddress.place_id}</div>
          </div>
        )}
      </div>

      {/* Debug section */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-medium text-gray-800 mb-2">Debug Info:</h3>
        <div className="text-xs font-mono text-gray-600 space-y-1">
          <div>Province Suggestions: {provinceSuggestions.length}</div>
          <div>Address Suggestions: {addressSuggestions.length}</div>
          <div>Loading Province: {loadingProvince ? 'Yes' : 'No'}</div>
          <div>Loading Address: {loadingAddress ? 'Yes' : 'No'}</div>
        </div>
      </div>

      {/* API Response Preview */}
      {(provinceSuggestions.length > 0 || addressSuggestions.length > 0) && (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg overflow-auto max-h-96">
          <h3 className="font-medium text-white mb-2">API Response (Raw):</h3>
          <pre className="text-xs text-green-400">
            {JSON.stringify(
              provinceSuggestions.length > 0 ? provinceSuggestions : addressSuggestions,
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  )
}
