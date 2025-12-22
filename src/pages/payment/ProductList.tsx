import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'
import { formatNumberWithCommas } from '@/utils/helpers'
import {
  TBaseProduct,
  TClientProductVariant,
  TMockupData,
  TPaymentProductItem,
  TMockupAttatchedData,
} from '@/utils/types/global'
import { useState } from 'react'

type TProductNoteProps = {
  mockupNote: TMockupAttatchedData['mockupNote']
}

const MockupNote = ({ mockupNote }: TProductNoteProps) => {
  return (
    mockupNote && (
      <div className="mt-3 p-1 bg-gray-100 border-l-4 border-main-cl rounded-md">
        <span className="font-bold pl-1">Ghi chú đơn hàng:</span>
        <span className="whitespace-pre-wrap ml-1">{mockupNote}</span>
      </div>
    )
  )
}

interface ProductListProps {
  cartItems: TPaymentProductItem[]
  onUpdateQuantity: (
    productId: TBaseProduct['id'],
    productVariantId: TClientProductVariant['id'],
    mockupId: TMockupData['id'],
    amount: number
  ) => void
  onRemoveProduct: (
    productId: TBaseProduct['id'],
    productVariantId: TClientProductVariant['id'],
    mockupId: TMockupData['id']
  ) => void
  onShowProductImage: (imageUrl: string) => void
  onEditMockup: (mockupDataId: string) => void
}

type TConfirmDeleteModalProps = {
  show: boolean
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmDeleteModal = ({ show, onConfirm, onCancel }: TConfirmDeleteModalProps) => {
  if (!show) return null

  return (
    <div className="5xl:text-2xl fixed inset-0 z-999 flex items-center justify-center bg-black/50 animate-pop-in p-4">
      <div onClick={onCancel} className="absolute inset-0"></div>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full relative z-10 p-4">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-red-600 p-3 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8 text-white 5xl:w-12 5xl:h-12"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" x2="10" y1="11" y2="17" />
              <line x1="14" x2="14" y1="11" y2="17" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="5xl:text-[1em] text-xl font-bold text-gray-800 text-center mb-3">
          Bạn xác nhận sẽ xóa sản phẩm này?
        </h3>

        {/* Description */}
        <p className="5xl:text-[0.8em] font-medium text-gray-600 text-center mb-6 text-sm">
          Sản phẩm sẽ bị xóa khỏi giỏ hàng và không thể hoàn tác.
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg active:scale-95 transition"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 mobile-touch text-white font-bold py-3 px-4 rounded-lg active:scale-95 transition"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

export const ProductList: React.FC<ProductListProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveProduct,
  onShowProductImage,
  onEditMockup,
}) => {
  const getMockupAttachedData = useProductUIDataStore((s) => s.getMockupAttachedData)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<{
    productId: TBaseProduct['id']
    productVariantId: TClientProductVariant['id']
    mockupId: TMockupData['id']
  } | null>(null)

  const handleDeleteClick = (
    productId: TBaseProduct['id'],
    productVariantId: TClientProductVariant['id'],
    mockupId: TMockupData['id']
  ) => {
    setPendingDelete({ productId, productVariantId, mockupId })
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    if (pendingDelete) {
      onRemoveProduct(
        pendingDelete.productId,
        pendingDelete.productVariantId,
        pendingDelete.mockupId
      )
    }
    setShowDeleteModal(false)
    setPendingDelete(null)
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false)
    setPendingDelete(null)
  }

  return (
    <section className="5xl:text-[0.8em] text-xs sm:text-sm flex flex-col gap-2 mb-2">
      <ConfirmDeleteModal
        show={showDeleteModal}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
      {cartItems.map(
        ({
          productId,
          mockupData,
          name,
          variantAttributesInfo: { material, scent, color, size },
          originalPrice,
          discountedPrice,
          quantity,
          surface,
          productVariantId,
        }) => (
          <div
            key={mockupData.id}
            className="bg-white rounded-2xl shadow-sm py-3 px-2 transition-all duration-200"
          >
            <div className="flex gap-3">
              {/* Product Image */}
              <div
                className="5xl:h-[280px] sm:h-[120px] sms:h-[150px] md:h-[180px] h-[100px] aspect-square cursor-pointer"
                onClick={() => onShowProductImage(mockupData.image)}
              >
                <img src={mockupData.image} alt={name} className="w-full h-full object-contain" />
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2 relative">
                  <h3 className="text-[1.1em] font-semibold text-gray-900 leading-snug pr-8">
                    {name}
                  </h3>
                  <button
                    onClick={() => {
                      onEditMockup(mockupData.id)
                    }}
                    className="5xl:top-1 5xl:right-1 absolute top-0 right-0 shrink-0 p-1.5 text-gray-600 bg-gray-200 transition-colors rounded-lg active:scale-95"
                    aria-label="Chỉnh sửa sản phẩm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-pen-icon lucide-pen w-3 h-3 sm:w-4 sm:h-4 5xl:w-7 5xl:h-7"
                    >
                      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                    </svg>
                  </button>
                </div>

                <div className="5xl:text-[0.8em] sm:gap-2 gap-1 flex-wrap flex items-center text-[1em] text-gray-500 mb-2">
                  {material && (
                    <span className="sm:py-1 py-0.5 bg-blue-100 text-blue-700 px-2 rounded-md font-medium">
                      {material.value}
                    </span>
                  )}
                  {scent && (
                    <span className="sm:py-1 py-0.5 bg-purple-100 text-purple-700 px-2 rounded-md font-medium">
                      {scent.value}
                    </span>
                  )}
                  {color && (
                    <span className="sm:py-1 py-0.5 bg-gray-100 px-2 rounded-md font-medium">
                      {color.value}
                    </span>
                  )}
                  {size && (
                    <span className="sm:py-1 py-0.5 bg-gray-100 px-2 rounded-md font-medium">
                      {size.value}
                    </span>
                  )}
                  <span className="sm:py-1 py-0.5 bg-pink-100 text-pink-600 px-2 rounded-md font-medium">
                    {surface.type === 'front' ? 'Mặt trước' : 'Mặt sau'}
                  </span>
                </div>

                {/* Price and Quantity */}
                <div className="sm:gap-2 gap-1 flex flex-col">
                  {discountedPrice ? (
                    <div className="flex flex-col">
                      <span className="smd:text-[1.3em] text-[1.5em] font-bold text-primary">
                        <span>{formatNumberWithCommas(discountedPrice)}</span>
                        <span> VND</span>
                      </span>
                      <span className="text-[0.7em] text-gray-400 line-through font-medium">
                        <span>{formatNumberWithCommas(originalPrice)}</span>
                        <span> VND</span>
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="smd:text-[1.3em] text-[1.5em] font-bold text-primary">
                        <span>{formatNumberWithCommas(originalPrice)}</span>
                        <span> VND</span>
                      </span>
                    </div>
                  )}

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
                      <button
                        onClick={() =>
                          onUpdateQuantity(productId, productVariantId, mockupData.id, -1)
                        }
                        className="flex items-center justify-center rounded-full bg-white shadow-sm active:scale-90 transition-transform"
                        style={{
                          pointerEvents: quantity <= 1 ? 'none' : 'auto',
                          opacity: quantity <= 1 ? 0.5 : 1,
                        }}
                        disabled={quantity <= 1}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-minus-icon lucide-minus text-gray-600 w-6 h-6 p-0.5 sm:w-7 sm:h-7 sm:p-1.5 5xl:w-9 5xl:h-9"
                        >
                          <path d="M5 12h14" />
                        </svg>
                      </button>
                      <span className="5xl:text-xl w-8 text-center font-semibold text-base">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(productId, productVariantId, mockupData.id, 1)
                        }
                        className="flex items-center justify-center rounded-full bg-white shadow-sm active:scale-90 transition-transform"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-plus-icon lucide-plus text-gray-600 w-6 h-6 p-0.5 sm:w-7 sm:h-7 sm:p-1.5 5xl:w-9 5xl:h-9"
                        >
                          <path d="M5 12h14" />
                          <path d="M12 5v14" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex h-fit ml-2">
                      <button
                        onClick={() =>
                          handleDeleteClick(productId, productVariantId, mockupData.id)
                        }
                        className="p-1 rounded-full bg-red-600 active:scale-90 transition"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-x-icon lucide-x text-white w-3.5 h-3.5 sm:w-5 sm:h-5"
                        >
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <MockupNote mockupNote={getMockupAttachedData(mockupData.id)?.mockupNote} />
          </div>
        )
      )}
    </section>
  )
}
