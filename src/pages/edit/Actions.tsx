import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'
import { EInternalEvents, eventEmitter } from '@/utils/events'
import { useNavigate } from 'react-router-dom'
import { MockupPreview } from './MockupPreview'
import { useEffect, useRef, useState } from 'react'
import { LocalStorageHelper } from '@/utils/localstorage'
import { toast } from 'react-toastify'
import { ETextFieldNameForKeyBoard } from '@/providers/GlobalKeyboardProvider'
import { fillQueryStringToURL } from '@/utils/helpers'

export const Actions = () => {
  const cartCount = useProductUIDataStore((s) => s.cartCount)
  const navigate = useNavigate()
  const [showMockupPreview, setShowMockupPreview] = useState(false)
  const pickedSurface = useProductUIDataStore((s) => s.pickedSurface)
  const productNoteRef = useRef<HTMLTextAreaElement>(null)

  const addToCart = () => {
    eventEmitter.emit(EInternalEvents.ADD_TO_CART)
  }

  const updateCartCount = () => {
    useProductUIDataStore.getState().setCartCount(LocalStorageHelper.countSavedMockupImages())
  }

  const recordProductNote = () => {
    const pickedProduct = useProductUIDataStore.getState().pickedProduct
    if (pickedProduct) {
      const productNote = productNoteRef.current?.value
      if (productNote) {
        useProductUIDataStore.getState().addProductNote(pickedProduct.id, productNote)
      } else {
        useProductUIDataStore
          .getState()
          .updateProductAttachedData(pickedProduct.id, { productNote: '' })
      }
    }
  }

  const beforeAddToCartHandler = () => {
    recordProductNote()
    addToCart()
  }

  const beforeNavigateToPaymentHandler = () => {
    recordProductNote()
    navigate('/payment' + fillQueryStringToURL())
  }

  const initProductAttachedData = () => {
    const pickedProduct = useProductUIDataStore.getState().pickedProduct
    if (pickedProduct) {
      const productAttachedData = useProductUIDataStore
        .getState()
        .getProductAttachedData(pickedProduct.id)
      if (productAttachedData) {
        if (productAttachedData.productNote) {
          if (productNoteRef.current) {
            productNoteRef.current.value = productAttachedData.productNote
          }
        }
      }
    }
  }

  const handleShowMockupPreview = () => {
    if (
      document.body.querySelector<HTMLElement>(
        '.NAME-print-area-container .NAME-print-area-allowed[data-is-out-of-bounds="true"]'
      )
    ) {
      return toast.error('Chỉnh sửa vượt ra ngoài vùng in cho phép. Vui lòng điều chỉnh lại.')
    }
    setShowMockupPreview(true)
  }

  useEffect(() => {
    updateCartCount()
    initProductAttachedData()
  }, [])

  return (
    <>
      <div className="smd:block hidden w-full order-3 mt-1">
        <label
          htmlFor="product-note"
          className="5xl:text-[1.3em] pl-1 text-sm font-medium text-gray-700 block mb-1"
        >
          Ghi chú đơn hàng (tùy chọn)
        </label>
        <textarea
          ref={productNoteRef}
          name="product-note"
          id="product-note-textfield"
          placeholder="Yêu cầu của bạn..."
          rows={2}
          className={`${ETextFieldNameForKeyBoard.VIRLTUAL_KEYBOARD_TEXTFIELD} 5xl:text-[1.2em] text-sm w-full rounded-md border border-gray-300 p-1.5 outline-main-cl outline-0 focus:outline-2 focus:border-main-cl resize-none transition`}
        ></textarea>
      </div>

      {/* Fixed Actions Bar - Bottom Right */}
      <div className="NAME-actions-bar fixed shadow-[0_0_10px_rgba(0,0,0,0.1)] rounded-t-lg bg-white bottom-0 right-2 z-40 smd:block hidden">
        <div className="px-3 py-4 5xl:text-[1.3em]">
          {/* Action Buttons */}
          <div className="flex gap-1.5">
            {/* Preview Button */}
            <div className="flex flex-col gap-1.5 w-[80%]">
              <button
                onClick={handleShowMockupPreview}
                className="5xl:text-[1.1em] flex-1 cursor-pointer border-main-cl border-2 active:bg-main-hover-cl text-main-cl font-bold py-1 px-2 rounded transition flex items-center justify-center gap-1.5 text-sm"
                title="Xem trước bản mockup"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 5xl:w-7 5xl:h-7"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span className="hidden lg:inline">Xem trước bản mockup</span>
              </button>

              {/* Add to Cart Button */}
              <button
                onClick={beforeAddToCartHandler}
                className="5xl:text-[1.1em] flex-1 cursor-pointer bg-main-cl hover:bg-dark-main-cl active:scale-95 text-white font-bold py-1 px-2 rounded transition flex items-center justify-center gap-1.5 text-sm"
                title="Thêm vào giỏ hàng"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 5xl:w-7 5xl:h-7"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                <span className="hidden lg:inline">Thêm vào giỏ hàng</span>
              </button>
            </div>
            {/* View Cart Button */}
            <button
              onClick={beforeNavigateToPaymentHandler}
              className="5xl:text-[0.85em] flex flex-col items-center justify-center gap-1 w-[20%] bg-main-cl text-white min-h-full relative cursor-pointer active:scale-95 font-bold p-2 rounded transition text-sm"
              title="Xem giỏ hàng"
            >
              {cartCount > 0 && (
                <span className="5xl:text-[25px] h-5 w-5 5xl:h-5 5xl:w-5 text-main-cl bg-white rounded-full text-[20px] leading-none font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8 5xl:w-10 5xl:h-10"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Actions - Hidden on desktop, shown on mobile */}
      <div className="smd:hidden block order-3 py-2">
        <div className="space-y-2">
          <div className="w-full">
            <label
              htmlFor="product-note-mobile"
              className="text-sm font-medium text-gray-700 block mb-1"
            >
              Ghi chú đơn hàng (tùy chọn)
            </label>
            <textarea
              ref={productNoteRef}
              name="product-note-mobile"
              id="product-note-mobile"
              placeholder="Bạn có yêu cầu gì với đơn hàng của mình không?"
              className={`${ETextFieldNameForKeyBoard.VIRLTUAL_KEYBOARD_TEXTFIELD} text-sm w-full rounded-md border-border p-2 outline-main-cl outline-0 focus:outline-2 resize-y`}
            ></textarea>
          </div>

          <button
            onClick={handleShowMockupPreview}
            className="w-full cursor-pointer border-main-cl border-2 active:bg-main-hover-cl text-main-cl font-bold h-10 px-4 rounded shadow-lg flex items-center justify-center gap-2 text-base"
          >
            Xem trước bản mockup
          </button>
          <button
            onClick={beforeAddToCartHandler}
            className="w-full cursor-pointer bg-main-cl mobile-touch text-white font-bold h-10 px-4 rounded shadow-lg flex items-center justify-center gap-2 text-base"
          >
            <span>Thêm vào giỏ hàng</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </button>
          <button
            onClick={beforeNavigateToPaymentHandler}
            className="w-full relative cursor-pointer bg-white mobile-touch text-main-cl border-2 border-main-cl font-bold h-10 px-4 rounded shadow-lg flex items-center justify-center gap-2 text-base"
          >
            <span className="inline-block">Xem giỏ hàng</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-main-cl text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {showMockupPreview && pickedSurface && (
        <MockupPreview onClose={() => setShowMockupPreview(false)} />
      )}
    </>
  )
}
