import { useEffect, useMemo, useState } from 'react'
import { formatNumberWithCommas } from '@/utils/helpers'
import {
  TPaymentProductItem,
  TClientProductVariant,
  TVoucher,
  TBaseProduct,
  TMockupData,
} from '@/utils/types/global'
import { PaymentModal } from '@/pages/payment/PaymentModal'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { LocalStorageHelper } from '@/utils/localstorage'
import { useGlobalContext } from '@/contexts/global-context'
import { VoucherSection } from '@/pages/payment/Voucher'
import { ProductList } from '@/pages/payment/ProductList'
import { useProductStore } from '@/stores/product/product.store'

interface IPaymentModalProps {
  imgSrc?: string
  onClose: () => void
}

const ProductImageModal = ({ imgSrc, onClose }: IPaymentModalProps) => {
  if (!imgSrc) return null
  return (
    <div className="flex fixed inset-0">
      <div onClick={onClose} className="absolute w-full h-full bg-black/50 z-10"></div>
      <div className="relative z-20 flex items-center justify-center m-auto">
        <img src={imgSrc} alt="Product image" className="max-h-[90vh] max-w-[90vw] object-contai" />
      </div>
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-30 text-gray-600 bg-white rounded-full p-2 active:scale-95 transition"
        aria-label="Close"
      >
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
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  )
}

const PaymentPage = () => {
  const { sessionId } = useGlobalContext()
  const [cartItems, setCartItems] = useState<TPaymentProductItem[]>([])
  const [appliedVoucher, setAppliedVoucher] = useState<TVoucher | null>(null)
  const [voucherDiscount, setVoucherDiscount] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()
  const [selectedImage, setSelectedImage] = useState<string>()
  const products = useProductStore((s) => s.products)

  // Hàm tính subtotal (tổng tiền trước giảm giá voucher)
  const calculateSubtotal = (): number => {
    return cartItems.reduce(
      (sum, item) => sum + (item.discountedPrice || item.originalPrice) * item.quantity,
      0
    )
  }

  // Handler khi voucher được apply/remove
  const handleVoucherApplied = (voucher: TVoucher | null, discount: number) => {
    setAppliedVoucher(voucher)
    setVoucherDiscount(discount)
  }

  const updateQuantity = (mockupId: string, delta: number, productImageId: number) => {
    let productStock: number = 0
    for (const product of products) {
      for (const image of product.variants) {
        if (image.id === productImageId) {
          productStock = image.stock
          break
        }
      }
    }
    setCartItems((items) =>
      items.map((item) =>
        item.mockupData.id === mockupId
          ? { ...item, quantity: Math.min(productStock, Math.max(1, item.quantity + delta)) }
          : item
      )
    )
  }

  const findProductVariantInProducts = (productVariantId: number): TClientProductVariant | null => {
    for (const product of products) {
      for (const variant of product.variants) {
        if (variant.id === productVariantId) {
          return variant
        }
      }
    }
    return null
  }

  const loadCartItems = () => {
    const savedItems = LocalStorageHelper.getSavedMockupData()
    if (savedItems && sessionId && savedItems.sessionId === sessionId) {
      const productItems: TPaymentProductItem[] = []
      for (const product of savedItems.productsInCart) {
        for (const variant of product.productVariants) {
          const productVariant = findProductVariantInProducts(variant.variantId)
          if (!productVariant) continue
          for (const mockupData of variant.mockupDataList) {
            const { imageData } = mockupData
            productItems.push({
              productId: product.productId,
              productVariantId: productVariant.id,
              name: product.productName,
              size: productVariant.size,
              color: productVariant.color,
              quantity: variant.quantity,
              originalPrice: productVariant.priceAmountOneSide,
              discountedPrice: productVariant.priceAfterDiscount,
              mockupData: {
                id: mockupData.id,
                image: imageData.dataUrl,
                heightPx: imageData.size.height,
                widthPx: imageData.size.width,
              },
              elementsVisualState: mockupData.elementsVisualState,
              surface: mockupData.surfaceInfo,
            })
          }
        }
      }
      if (productItems.length > 0) {
        setCartItems(productItems)
      }
    }
  }

  const removeProductFromCart = (
    productId: TBaseProduct['id'],
    productVariantId: TClientProductVariant['id'],
    mockupId: TMockupData['id']
  ) => {
    if (!sessionId) return
    setCartItems((items) =>
      items.filter((item) => {
        if (
          item.productId === productId &&
          item.productVariantId === productVariantId &&
          item.mockupData.id === mockupId
        ) {
          return false
        }
        return true
      })
    )
    LocalStorageHelper.removeSavedMockupImage(sessionId, productId, productVariantId, mockupId)
  }

  const handleShowProductImageModal = (imgSrc: string) => {
    setSelectedImage(imgSrc)
  }

  const handleCloseProductImageModal = () => {
    setSelectedImage(undefined)
  }

  const backToEditPage = () => {
    navigate('/edit')
  }

  const handleEditMockup = (mockupDataId: string) => {
    navigate(`/edit?mockupId=${mockupDataId}`)
  }

  const [subtotal, discount, total] = useMemo(() => {
    const subtotalValue = calculateSubtotal()
    const totalValue = subtotalValue - voucherDiscount

    return [subtotalValue, voucherDiscount, totalValue]
  }, [cartItems, voucherDiscount])

  useEffect(() => {
    document.body.style.overflow = showModal ? 'hidden' : 'auto'
  }, [showModal])

  useEffect(() => {
    requestIdleCallback(() => {
      loadCartItems()
    })
  }, [])

  return (
    <div className="min-h-screen pb-12 md:pb-6 bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-2">
          <h1 className="text-2xl font-bold text-gray-900">Trang thanh toán</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            <span>{cartItems.length}</span>
            <span> sản phẩm trong giỏ hàng</span>
          </p>
        </div>
      </header>

      {cartItems && cartItems.length > 0 ? (
        <>
          {/* Main Content */}
          <div className="flex flex-col gap-2 md:gap-4 max-w-6xl mx-auto px-2 md:px-6 lg:px-8 pt-2 md:pt-4 pb-6 md:pb-8 bg-gray-100">
            <div>
              <button
                onClick={backToEditPage}
                className="flex items-center gap-2 py-1 px-2 md:px-4 text-sm md:text-base bg-main-cl rounded-md text-white font-bold active:scale-95 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-arrow-left-icon lucide-arrow-left md:w-5 md:h-5"
                >
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
                <span>Quay về</span>
              </button>
            </div>

            {/* Layout: 2 columns on medium+ screens */}
            <div className="grid grid-cols-1 md:grid-cols-[4fr_2fr] gap-2">
              {/* Left Column: Product List */}
              <div>
                <ProductList
                  cartItems={cartItems}
                  onUpdateQuantity={updateQuantity}
                  onRemoveProduct={removeProductFromCart}
                  onShowProductImage={handleShowProductImageModal}
                  onEditMockup={handleEditMockup}
                />

                {/* Discount Code Section - Mobile */}
                <div className="md:hidden mt-2">
                  <VoucherSection
                    orderSubtotal={calculateSubtotal()}
                    onVoucherApplied={handleVoucherApplied}
                  />
                </div>
              </div>

              {/* Right Column: Summary & Voucher (Sticky on large screens) */}
              <div className="flex flex-col gap-2 md:gap-4">
                {/* Discount Code Section - Desktop */}
                <div className="hidden md:block">
                  <VoucherSection
                    orderSubtotal={calculateSubtotal()}
                    onVoucherApplied={handleVoucherApplied}
                  />
                </div>

                {/* Order Summary */}
                <section className="bg-white rounded-2xl shadow-sm p-4 md:p-5 space-y-2 md:sticky md:top-4">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 md:mb-3">
                    Tổng đơn hàng
                  </h3>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="font-medium text-gray-900">
                      <span>{formatNumberWithCommas(subtotal)}</span>
                      <span> VND</span>
                    </span>
                  </div>
                  {appliedVoucher && discount > 0 && (
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-green-600">Giảm giá ({appliedVoucher.code})</span>
                      <span className="font-medium text-green-600">
                        <span>-</span>
                        <span>{formatNumberWithCommas(discount)}</span>
                        <span> VND</span>
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900 text-sm md:text-base">
                        Tổng cộng
                      </span>
                      <span className="text-lg md:text-xl font-bold text-primary">
                        <span>{formatNumberWithCommas(total)}</span>
                        <span> VND</span>
                      </span>
                    </div>
                  </div>

                  {/* Checkout Button - Desktop (in summary) */}
                  <div className="hidden md:block mt-3 md:mt-4">
                    <button
                      onClick={() => setShowModal(true)}
                      className="flex items-center justify-center gap-2 w-full mt-4 h-11 bg-main-cl hover:scale-95 text-white font-bold text-base rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition duration-200"
                    >
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
                        className="lucide lucide-banknote-icon lucide-banknote"
                      >
                        <rect width="20" height="12" x="2" y="6" rx="2" />
                        <circle cx="12" cy="12" r="2" />
                        <path d="M6 12h.01M18 12h.01" />
                      </svg>
                      <span>Tiến hành thanh toán</span>
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* Fixed Checkout Button - Mobile only */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg px-2">
            <div className="w-full mx-auto px-2 py-2">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center justify-center gap-2 w-full h-[45px] bg-main-cl text-white font-bold text-lg rounded-xl shadow-lg active:scale-95 transition duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-banknote-icon lucide-banknote"
                >
                  <rect width="20" height="12" x="2" y="6" rx="2" />
                  <circle cx="12" cy="12" r="2" />
                  <path d="M6 12h.01M18 12h.01" />
                </svg>
                <span>Tiến hành thanh toán</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center px-4 pb-10 mt-5">
          <div className="max-w-sm md:max-w-md lg:max-w-lg w-full text-center">
            {/* Icon */}
            <div className="relative mb-8 md:mb-10 lg:mb-12">
              <div className="relative bg-white rounded-full p-8 md:p-10 lg:p-12 shadow-md md:shadow-lg mx-auto w-40 h-40 md:w-48 md:h-48 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="90"
                  height="90"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-300"
                >
                  <circle cx="8" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
              </div>
            </div>

            {/* Text */}
            <h2 className="text-2xl font-bold text-gray-800 mb-3 md:mb-4">Giỏ hàng trống</h2>
            <p className="text-gray-500 md:text-lg mb-8 md:mb-10 lg:mb-12 leading-relaxed px-4">
              Hãy quay lại trang chỉnh sửa để tạo và thêm sản phẩm yêu thích của bạn vào giỏ hàng
              nhé!
            </p>

            {/* Action Button */}
            <button
              onClick={() => navigate('/edit')}
              className="group relative w-full md:max-w-md lg:max-w-lg mx-auto bg-main-cl hover:bg-dark-main-cl text-white font-bold p-4 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative flex items-center justify-center gap-3 md:gap-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:-translate-x-1 transition-transform md:w-6 md:h-6"
                >
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
                <span className="text-lg">Quay lại trang chỉnh sửa</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        show={showModal}
        paymentInfo={{
          total,
        }}
        onHideShow={setShowModal}
        voucherCode={appliedVoucher?.code}
        cartItems={cartItems}
      />

      {createPortal(
        <ProductImageModal imgSrc={selectedImage} onClose={handleCloseProductImageModal} />,
        document.body
      )}
    </div>
  )
}

export default PaymentPage
