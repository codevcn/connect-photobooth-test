import { useState } from 'react'
import { VietmapAutocompleteTest } from '../components/Vietmap'
import { GoongAutocompleteTest } from '../components/Goong'

type TApiProvider = 'vietmap' | 'goong'

const Dev = () => {
  const [activeProvider, setActiveProvider] = useState<TApiProvider>('vietmap')

  return (
    <div className="p-4">
      {/* Toggle buttons */}
      <div className="flex gap-2 mb-6 justify-center">
        <button
          onClick={() => setActiveProvider('vietmap')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeProvider === 'vietmap'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Vietmap API
        </button>
        <button
          onClick={() => setActiveProvider('goong')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeProvider === 'goong'
              ? 'bg-green-600 text-white shadow-lg'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Goong API
        </button>
      </div>

      {/* Content */}
      {activeProvider === 'vietmap' ? <VietmapAutocompleteTest /> : <GoongAutocompleteTest />}
    </div>
  )
}

export default Dev
