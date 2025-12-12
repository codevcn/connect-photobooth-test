import { TPaymentType } from '@/utils/types/global'

interface PaymentMethodSelectorProps {
  selectedMethod: TPaymentType
  onSelectMethod: (method: TPaymentType) => void
}

export const PaymentMethodSelector = ({
  selectedMethod,
  onSelectMethod,
}: PaymentMethodSelectorProps) => {
  return (
    <section className="5xl:text-3xl flex flex-col gap-2">
      <h3 className="5xl:text-[0.8em] font-semibold text-gray-900 text-lg">
        Phương thức thanh toán
      </h3>

      <div className="grid-cols-1 grid smd:grid-cols-1 gap-x-2 gap-y-2 smd:gap-y-1">
        {/* {selectedMethod === 'momo' ? (
          <div className="smd:row-span-2 flex items-center bg-linear-to-r from-pink-50 to-purple-50 border-2 border-pink-200 rounded-xl px-3 py-2">
            <div className="flex items-center justify-between gap-2 w-full">
              <div className="flex items-center gap-3">
                <div className="bg-[#A50064] rounded-lg p-2">
                  <img src="/images/logo/momo.png" alt="Momo" className="5xl:h-9 5xl:w-9 h-6 w-6" />
                </div>
                <div>
                  <p className="5xl:text-[0.6em] text-sm text-gray-600">Đang chọn</p>
                  <p className="5xl:text-[0.7em] font-bold text-gray-900">Thanh toán Momo</p>
                </div>
              </div>
              <div className="bg-green-500 rounded-full p-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-check-icon lucide-check text-white"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onSelectMethod('momo')}
            className="5xl:h-[60px] h-[50px] bg-[#A50064] text-white flex items-center justify-center gap-2 px-4 rounded-xl border-2 border-transparent transition hover:border-pink-200 active:scale-95"
          >
            <img src="/images/logo/momo.png" alt="Momo" className="5xl:h-9 5xl:w-9 h-8 w-8" />
            <span className="5xl:text-[0.9em] font-medium">Thanh toán với Momo</span>
          </button>
        )}

        {selectedMethod === 'zalo' ? (
          <div className="smd:row-span-2 flex items-center bg-linear-to-r from-pink-50 to-purple-50 border-2 border-pink-200 rounded-xl px-3 py-2">
            <div className="flex items-center justify-between gap-2 w-full">
              <div className="flex items-center gap-3">
                <div className="bg-[#0144DB] rounded-lg p-2">
                  <img src="/images/logo/zalo.png" alt="Zalo" className="5xl:h-9 5xl:w-9 h-6 w-6" />
                </div>
                <div>
                  <p className="5xl:text-[0.6em] text-sm text-gray-600 font-medium">Đang chọn</p>
                  <p className="5xl:text-[0.7em] font-bold text-gray-900">Thanh toán Zalo</p>
                </div>
              </div>
              <div className="bg-green-500 rounded-full p-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-check-icon lucide-check text-white"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onSelectMethod('zalo')}
            className="5xl:h-[60px] w-full h-[50px] bg-[#0144DB] text-white flex items-center justify-center gap-2 px-4 rounded-xl border-2 border-transparent transition hover:border-pink-200 active:scale-95"
          >
            <img src="/images/logo/zalo.png" alt="Zalo" className="5xl:h-9 5xl:w-9 h-6 w-6" />
            <span className="5xl:text-[0.9em] font-medium">Thanh toán với Zalo</span>
          </button>
        )} */}

        {selectedMethod === 'bank-transfer' ? (
          <div className="smd:col-span-1 bg-linear-to-r from-pink-50 to-purple-50 border-2 border-pink-200 rounded-xl px-3 py-2">
            <div className="flex items-center justify-between gap-2 w-full">
              <div className="flex items-center gap-3">
                <div className="bg-green-600 rounded-lg p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-banknote-icon lucide-banknote text-white"
                  >
                    <rect width="20" height="12" x="2" y="6" rx="2" />
                    <circle cx="12" cy="12" r="2" />
                    <path d="M6 12h.01M18 12h.01" />
                  </svg>
                </div>
                <div>
                  <p className="5xl:text-[0.6em] text-sm text-gray-600 font-medium">Đang chọn</p>
                  <p className="5xl:text-[0.7em] font-bold text-gray-900">Thanh toán ngân hàng</p>
                </div>
              </div>
              <div className="bg-green-500 rounded-full p-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-check-icon lucide-check text-white w-4 h-4"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onSelectMethod('bank-transfer')}
            className="5xl:h-[55px] w-full h-10 bg-white text-gray-900 flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 shadow-sm transition hover:border-main-cl active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-banknote-icon lucide-banknote text-green-600 5xl:h-9 5xl:w-9 h-6 w-6"
            >
              <rect width="20" height="12" x="2" y="6" rx="2" />
              <circle cx="12" cy="12" r="2" />
              <path d="M6 12h.01M18 12h.01" />
            </svg>
            <span className="5xl:text-[0.7em] font-medium">Thanh toán ngân hàng</span>
          </button>
        )}
      </div>
    </section>
  )
}
