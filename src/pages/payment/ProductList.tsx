import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'
import { formatNumberWithCommas } from '@/utils/helpers'
import {
  TBaseProduct,
  TClientProductVariant,
  TMockupData,
  TPaymentProductItem,
  TProductAttatchedData,
} from '@/utils/types/global'
import { toast } from 'react-toastify'

type ProductNoteProps = {
  productNote: TProductAttatchedData['productNote']
}

const ProductNote = ({ productNote }: ProductNoteProps) => {
  return (
    productNote && (
      <div className="mt-3 p-1 bg-gray-100 border-l-4 border-main-cl rounded-md">
        <span className="font-bold">Ghi chú đơn hàng:</span>
        <span className="whitespace-pre-wrap ml-1">{productNote}</span>
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

export const ProductList: React.FC<ProductListProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveProduct,
  onShowProductImage,
  onEditMockup,
}) => {
  const getProductAttachedData = useProductUIDataStore((s) => s.getProductAttachedData)

  return (
    <section className="text-xs sm:text-sm flex flex-col gap-2 mb-2">
      {cartItems.map(
        ({
          productId,
          mockupData,
          name,
          size,
          color,
          originalPrice,
          discountedPrice,
          quantity,
          surface,
          productVariantId,
          productStock,
        }) => (
          <div
            key={mockupData.id}
            className="bg-white rounded-2xl shadow-sm py-3 px-2 transition-all duration-200"
          >
            <div className="flex gap-3">
              {/* Product Image */}
              <div
                className="sm:h-[120px] sms:h-[150px] md:h-[180px] h-[100px] aspect-square cursor-pointer"
                onClick={() => onShowProductImage(mockupData.image)}
              >
                <img src={mockupData.image} alt={name} className="w-full h-full object-contain" />
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-[1em] font-semibold text-gray-900 leading-tight">{name}</h3>
                  <button
                    onClick={() => {
                      toast.info('Đang tạm khóa')
                      onEditMockup(mockupData.id)
                    }}
                    className="shrink-0 p-1.5 text-gray-600 bg-gray-200 transition-colors rounded-lg active:scale-95"
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
                      className="lucide lucide-pen-icon lucide-pen w-3 h-3 sm:w-4 sm:h-4"
                    >
                      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                    </svg>
                  </button>
                </div>

                <div className="sm:gap-2 gap-1 flex-wrap flex items-center text-[1em] text-gray-500 mb-2">
                  <span className="sm:py-1 py-0.5 bg-gray-100 px-2 rounded-md font-medium">
                    {size}
                  </span>
                  <span className="sm:py-1 py-0.5 bg-gray-100 px-2 rounded-md font-medium">
                    {color.title}
                  </span>
                  <span className="sm:py-1 py-0.5 bg-pink-100 text-pink-600 px-2 rounded-md font-medium">
                    {surface.type === 'front' ? 'Mặt trước' : 'Mặt sau'}
                  </span>
                </div>

                {/* Price and Quantity */}
                <div className="sm:gap-2 gap-1 flex flex-col">
                  {discountedPrice ? (
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 line-through font-medium">
                        <span>{formatNumberWithCommas(originalPrice)}</span>
                        <span> VND</span>
                      </span>
                      <span className="text-[1.2em] font-bold text-primary">
                        <span>{formatNumberWithCommas(discountedPrice)}</span>
                        <span> VND</span>
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[1.2em] font-bold text-primary">
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
                          className="lucide lucide-minus-icon lucide-minus text-gray-600 w-4.5 h-4.5 p-0.5 sm:w-7 sm:h-7 sm:p-1.5"
                        >
                          <path d="M5 12h14" />
                        </svg>
                      </button>
                      <span className="w-8 text-center font-semibold text-sm">{quantity}</span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(productId, productVariantId, mockupData.id, 1)
                        }
                        className="flex items-center justify-center rounded-full bg-white shadow-sm active:scale-90 transition-transform"
                        style={{
                          pointerEvents: quantity >= productStock ? 'none' : 'auto',
                          opacity: quantity >= productStock ? 0.5 : 1,
                        }}
                        disabled={quantity >= productStock}
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
                          className="lucide lucide-plus-icon lucide-plus text-gray-600 w-4.5 h-4.5 p-0.5 sm:w-7 sm:h-7 sm:p-1.5"
                        >
                          <path d="M5 12h14" />
                          <path d="M12 5v14" />
                        </svg>
                      </button>
                    </div>
                    <div>
                      <button
                        onClick={() => onRemoveProduct(productId, productVariantId, mockupData.id)}
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
                          className="lucide lucide-x-icon lucide-x text-white w-3 h-3 sm:w-6 sm:h-6"
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

            <ProductNote productNote={getProductAttachedData(productId)?.productNote} />
          </div>
        )
      )}
    </section>
  )
}
