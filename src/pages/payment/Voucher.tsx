import { useEffect, useRef, useState } from 'react'
import { voucherService } from '@/services/voucher.service'
import { TVoucher, TPaymentProductItem } from '@/utils/types/global'
import { TCheckVoucherReq } from '@/utils/types/api'
import { ETextFieldNameForKeyBoard } from '@/providers/GlobalKeyboardProvider'
import { useVoucherStore } from '@/stores/voucher/product.store'

type VoucherSectionProps = {
  cartItems: TPaymentProductItem[]
  onVoucherApplied: (voucher: TVoucher | null, discount: number) => void
}

type TDiscountMessage = {
  message: string
  status: 'success' | 'error'
}

export const VoucherSection = ({ cartItems, onVoucherApplied }: VoucherSectionProps) => {
  const appliedVoucher = useVoucherStore((state) => state.appliedVoucher)
  const setAppliedVoucher = useVoucherStore((state) => state.setAppliedVoucher)
  const [discountMessage, setDiscountMessage] = useState<TDiscountMessage>()
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false)
  const reapplyVoucherID = useVoucherStore((state) => state.reapplyVoucherID)
  const voucherInputRef = useRef<HTMLInputElement>(null)
  const reapplyVoucherIDRef = useRef<string | null>(reapplyVoucherID)

  // Convert cart items to API format
  const buildVoucherCheckItems = (): TCheckVoucherReq['items'] => {
    return cartItems.map((item) => ({
      variant_id: item.productVariantId,
      quantity: item.quantity,
      surfaces: [
        {
          surface_id: item.surface.id,
          editor_state_json: item.elementsVisualState,
          file_url: item.mockupData.image,
          width_px: item.mockupData.widthPx,
          height_px: item.mockupData.heightPx,
        },
      ],
    }))
  }

  // Hàm áp dụng voucher
  const applyVoucher = async () => {
    const discountCode = voucherInputRef.current?.value || ''
    console.log('>>> discountCode:', discountCode)
    if (!discountCode.trim()) {
      setDiscountMessage({ message: 'Vui lòng nhập mã giảm giá', status: 'error' })
      return
    }

    setIsApplyingVoucher(true)
    setDiscountMessage(undefined)

    try {
      const items = buildVoucherCheckItems()
      const result = await voucherService.checkVoucherValidity(
        discountCode.trim(),
        items,
        import.meta.env.VITE_STORE_CODE
      )

      if (result.success && result.voucher) {
        setAppliedVoucher(result.voucher)
        setDiscountMessage({ message: 'Áp dụng mã giảm giá thành công', status: 'success' })

        // Get discount from API response (voucher already contains discount info)
        const discount = result.discount || 0
        onVoucherApplied(result.voucher, discount)
      } else {
        setAppliedVoucher(null)
        setDiscountMessage({ message: 'Mã giảm giá không hợp lệ', status: 'error' })
        onVoucherApplied(null, 0)
      }
    } catch (error) {
      setAppliedVoucher(null)
      setDiscountMessage({ message: 'Mã giảm giá không hợp lệ', status: 'error' })
      onVoucherApplied(null, 0)
    } finally {
      setIsApplyingVoucher(false)
    }
  }

  // Hàm xóa voucher
  const removeVoucher = () => {
    setAppliedVoucher(null)
    voucherInputRef.current!.value = ''
    setDiscountMessage(undefined)
    onVoucherApplied(null, 0)
  }

  useEffect(() => {
    if (appliedVoucher && reapplyVoucherIDRef.current !== reapplyVoucherID) {
      reapplyVoucherIDRef.current = reapplyVoucherID
      applyVoucher()
    }
  }, [reapplyVoucherID, appliedVoucher])

  return (
    <section className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
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
          className="lucide lucide-tag-icon lucide-tag text-main-cl 5xl:w-6 5xl:h-6"
        >
          <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
          <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
        </svg>
        <h2 className="5xl:text-[0.9em] font-semibold text-gray-900">Mã giảm giá</h2>
      </div>

      {/* Applied Voucher Display */}
      {appliedVoucher && (
        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-green-700">{appliedVoucher.code}</span>
                <span className="text-xs px-2 py-0.5 bg-green-200 text-green-800 rounded-full">
                  Đã áp dụng
                </span>
              </div>
              <p className="text-sm text-green-600">{appliedVoucher.description}</p>
            </div>
            <button
              onClick={removeVoucher}
              className="p-1 text-green-600 hover:text-green-800 transition"
              aria-label="Xóa voucher"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-x-icon lucide-x"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 w-full md:flex-col md:items-end">
        <input
          type="text"
          ref={voucherInputRef}
          onKeyDown={(e) => e.key === 'Enter' && !isApplyingVoucher && applyVoucher()}
          placeholder="Nhập mã khuyến mãi"
          disabled={!!appliedVoucher || isApplyingVoucher}
          className={`${ETextFieldNameForKeyBoard.VIRLTUAL_KEYBOARD_TEXTFIELD} 5xl:text-[0.8em] md:h-10 h-9 flex-1 w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-main-cl focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed`}
        />
        <button
          onClick={applyVoucher}
          disabled={!!appliedVoucher || isApplyingVoucher}
          className="5xl:text-[0.8em] 5xl:h-12 h-8 px-6 bg-main-cl text-white font-medium rounded-xl active:scale-95 transition shadow-sm w-max disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isApplyingVoucher ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-loader-circle-icon lucide-loader-circle animate-spin"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <span>Đang kiểm tra...</span>
            </>
          ) : (
            <span>Áp dụng</span>
          )}
        </button>
      </div>
      {discountMessage && !appliedVoucher && (
        <p
          className={`mt-2 text-[0.8em] flex items-center gap-1 ${
            discountMessage.status === 'success' ? 'text-green-600' : 'text-red-500'
          }`}
        >
          {discountMessage.status === 'success' ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-check-circle-icon lucide-check-circle 5xl:w-6 5xl:h-6 w-4 h-4"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <path d="m9 11 3 3L22 4" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-triangle-alert-icon lucide-triangle-alert 5xl:w-6 5xl:h-6 w-4 h-4"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          )}
          <span>{discountMessage.message}</span>
        </p>
      )}
    </section>
  )
}
