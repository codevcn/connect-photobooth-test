import { useState } from 'react'

type TTabType = 'description' | 'shipping' | 'personalization'

type TAdditionalInformationProps = {
  productDescription?: string
}

export const AdditionalInformation = ({ productDescription }: TAdditionalInformationProps) => {
  const [activeTab, setActiveTab] = useState<TTabType>()

  const handlePickTab = (tab: TTabType) => {
    if (tab === activeTab) {
      setActiveTab(undefined)
    } else {
      setActiveTab(tab)
    }
  }

  return (
    <div className="flex flex-col gap-1 w-full bg-gray-100 rounded-lg shadow-sm p-2 border-border">
      <div className="w-full">
        <div
          className="w-full group flex items-center mobile-touch justify-between p-4 cursor-pointer hover:bg-white border-border rounded-md border-b border-transparent"
          onClick={() => handlePickTab('description')}
        >
          <div className="flex items-center gap-4">
            <div className="text-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                />
              </svg>
            </div>
            <span className="text-gray-700 font-semibold text-base">Description</span>
          </div>
          <div className="text-gray-600 group-hover:text-gray-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className={`${activeTab === 'description' ? 'rotate-90' : ''} w-5 h-5`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </div>
        {activeTab === 'description' && (
          <div className="px-2 py-4 text-sm text-black/80">
            {productDescription || 'Sản phẩm chưa có mô tả'}
          </div>
        )}
      </div>

      <div className="group flex items-center justify-between p-4 cursor-pointer hover:bg-white border-border rounded-md transition-colors border-b border-transparent">
        <div className="flex items-center gap-4">
          <div className="text-gray-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.713"
              />
            </svg>
          </div>
          <span className="text-gray-700 font-semibold text-base">Shipping & Returns</span>
        </div>
        <div className="text-gray-600 group-hover:text-gray-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </div>
    </div>
  )
}
