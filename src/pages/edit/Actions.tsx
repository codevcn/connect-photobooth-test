import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'
import { EInternalEvents, eventEmitter } from '@/utils/events'
import { useNavigate } from 'react-router-dom'
import { MockupPreview } from './MockupPreview'
import { useEffect, useRef, useState } from 'react'
import { LocalStorageHelper } from '@/utils/localstorage'
import { toast } from 'react-toastify'
import { ETextFieldNameForKeyBoard } from '@/providers/GlobalKeyboardProvider'

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
    navigate('/payment')
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
    <div className="5xl:text-[1.5em] 5xl:gap-3 flex flex-col gap-2 leading-none order-3 py-2">
      <div className="w-full">
        <label htmlFor="product-note" className="5xl:text-[1em] text-sm">
          Ghi chú đơn hàng (tùy chọn)
        </label>
        <textarea
          ref={productNoteRef}
          name="product-note"
          id="product-note-textfield"
          placeholder="Bạn có yêu cầu gì với đơn hàng của mình không?"
          className={`${ETextFieldNameForKeyBoard.VIRLTUAL_KEYBOARD_TEXTFIELD} 5xl:text-[1em] md:text-base text-sm w-full mt-1 rounded-md border-border p-2 outline-main-cl outline-0 focus:outline-2 resize-y`}
        ></textarea>
      </div>

      <button
        onClick={handleShowMockupPreview}
        className="5xl:text-[1em] 5xl:h-13 w-full cursor-pointer border-main-cl border-2 active:bg-main-hover-cl text-main-cl font-bold h-10 px-4 rounded shadow-lg touch-target flex items-center justify-center gap-2 text-lg"
      >
        Xem trước bản mockup
      </button>
      <button
        onClick={beforeAddToCartHandler}
        className="5xl:text-[1em] 5xl:h-13 w-full cursor-pointer bg-main-cl mobile-touch text-white font-bold h-10 px-4 rounded shadow-lg flex items-center justify-center gap-2 text-lg"
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
          className="lucide lucide-check-icon lucide-check w-6 h-6 5xl:w-8 5xl:h-8"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </button>
      <button
        onClick={beforeNavigateToPaymentHandler}
        className="5xl:text-[1em] 5xl:h-13 w-full relative cursor-pointer bg-main-cl mobile-touch text-white font-bold h-10 px-4 rounded shadow-lg flex items-center justify-center gap-2 text-lg"
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
          className="lucide lucide-shopping-cart-icon lucide-shopping-cart w-6 h-6 5xl:w-8 5xl:h-8"
        >
          <circle cx="8" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
        {cartCount > 0 && (
          <span className="5xl:text-3xl 5xl:h-8 5xl:w-8 outline-2 outline-white absolute -top-2 -right-2 bg-main-cl text-white text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </button>

      {showMockupPreview && pickedSurface && (
        <MockupPreview onClose={() => setShowMockupPreview(false)} />
      )}
    </div>
  )
}
