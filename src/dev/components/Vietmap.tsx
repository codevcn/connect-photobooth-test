import { useState } from 'react'
import { useDebouncedCallback } from '@/hooks/use-debounce'
import { addressService } from '@/services/address.service'
import { TClientLocationResult } from '@/utils/types/global'

export const VietmapAutocompleteTest = () => {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<TClientLocationResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSuggestions = async (text: string) => {
    if (!text.trim()) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const results = await addressService.autocompleteAddress(text)
      setSuggestions(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const debouncedFetch = useDebouncedCallback(fetchSuggestions, 500)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    debouncedFetch(value)
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Vietmap Autocomplete Test</h2>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Nhập địa chỉ để tìm kiếm..."
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      </div>

      {isLoading && <div style={{ padding: '10px', color: '#666' }}>Đang tìm kiếm...</div>}

      {error && (
        <div style={{ padding: '10px', color: 'red', backgroundColor: '#fee' }}>{error}</div>
      )}

      {!isLoading && suggestions.length > 0 && (
        <div style={{ border: '1px solid #ccc', borderRadius: '4px' }}>
          <h3 style={{ padding: '10px', margin: 0, backgroundColor: '#f5f5f5' }}>
            Kết quả ({suggestions.length})
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion.refId || index}
                style={{
                  padding: '12px',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
                onClick={() => {
                  setInputValue(suggestion.display)
                  setSuggestions([])
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{suggestion.name}</div>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                  📍 {suggestion.address}
                </div>
                {suggestion.boundaries && suggestion.boundaries.length > 0 && (
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {suggestion.boundaries.map((b) => b.fullName).join(', ')}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isLoading && inputValue && suggestions.length === 0 && !error && (
        <div style={{ padding: '10px', color: '#666' }}>Không tìm thấy kết quả</div>
      )}
    </div>
  )
}
