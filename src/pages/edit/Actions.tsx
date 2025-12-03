import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'
import { EInternalEvents, eventEmitter } from '@/utils/events'
import { useNavigate } from 'react-router-dom'
import { MockupPreview } from './MockupPreview'
import { useEffect, useRef, useState } from 'react'
import { LocalStorageHelper } from '@/utils/localstorage'
import { toast } from 'react-toastify'

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
    <div className="order-3 py-2">
      <div className="w-full">
        <label htmlFor="product-note" className="text-sm">
          Ghi chú đơn hàng (tùy chọn)
        </label>
        <textarea
          ref={productNoteRef}
          name="product-note"
          id="product-note-textfield"
          placeholder="Bạn có yêu cầu gì với đơn hàng của mình không?"
          className="md:text-base text-sm w-full mt-1 rounded-md border-border p-2 outline-main-cl outline-0 focus:outline-2 resize-y"
        ></textarea>
      </div>

      <button
        onClick={handleShowMockupPreview}
        className="mt-2 w-full cursor-pointer border-main-cl border-2 active:bg-main-hover-cl text-main-cl font-bold h-10 px-4 rounded shadow-lg touch-target flex items-center justify-center gap-2 text-lg"
      >
        Xem trước bản mockup
      </button>
      <div className="flex gap-2 items-stretch mt-3 flex-col lg:flex-row">
        <button
          onClick={beforeAddToCartHandler}
          className="w-full cursor-pointer bg-main-cl mobile-touch text-white font-bold h-10 px-4 rounded shadow-lg flex items-center justify-center gap-2 text-lg"
        >
          <span>Thêm vào giỏ hàng</span>
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
            className="lucide lucide-check-icon lucide-check"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </button>
        <button
          onClick={beforeNavigateToPaymentHandler}
          className="flex items-center justify-center gap-2 lg:block relative cursor-pointer bg-white border-2 border-gray-200 px-2 h-10 rounded-md shadow mobile-touch"
        >
          <span className="inline-block lg:hidden">Xem giỏ hàng</span>
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
            className="lucide lucide-shopping-cart-icon lucide-shopping-cart"
          >
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-main-cl text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {showMockupPreview && pickedSurface && (
        <MockupPreview onClose={() => setShowMockupPreview(false)} />
      )}
    </div>
  )
}
