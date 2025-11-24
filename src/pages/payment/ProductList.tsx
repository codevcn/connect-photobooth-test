import { formatNumberWithCommas } from '@/utils/helpers'
import {
  TBaseProduct,
  TClientProductVariant,
  TMockupData,
  TPaymentProductItem,
} from '@/utils/types/global'

interface ProductListProps {
  cartItems: TPaymentProductItem[]
  onUpdateQuantity: (mockupDataId: string, delta: number, productId: number) => void
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
  return (
    <section className="flex flex-col gap-2">
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
        }) => (
          <div
            key={mockupData.id}
            className="bg-white rounded-2xl shadow-sm py-4 px-2 transition-all duration-200"
          >
            <div className="flex gap-3">
              {/* Product Image */}
              <div
                className="w-[88px] md:w-[200px] h-full min-h-full cursor-pointer"
                onClick={() => onShowProductImage(mockupData.image)}
              >
                <img src={mockupData.image} alt={name} className="w-full h-full object-contain" />
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">{name}</h3>
                  <button
                    onClick={() => onEditMockup(mockupData.id)}
                    className="shrink-0 p-1.5 text-gray-600 bg-gray-200 transition-colors rounded-lg active:scale-95"
                    aria-label="Chỉnh sửa sản phẩm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-pen-icon lucide-pen"
                    >
                      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <span className="bg-gray-100 px-2 py-1 rounded-md font-medium">{size}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded-md font-medium">
                    {color.title}
                  </span>
                  <span className="bg-pink-100 text-pink-600 px-2 py-1 rounded-md font-medium">
                    {surface.type === 'front' ? 'Mặt trước' : 'Mặt sau'}
                  </span>
                </div>

                {/* Price and Quantity */}
                <div className="flex flex-col gap-3">
                  {discountedPrice ? (
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 line-through font-medium">
                        <span>{formatNumberWithCommas(originalPrice)}</span>
                        <span> VND</span>
                      </span>
                      <span className="text-lg font-bold text-primary">
                        <span>{formatNumberWithCommas(discountedPrice)}</span>
                        <span> VND</span>
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-lg font-bold text-primary">
                        <span>{formatNumberWithCommas(originalPrice)}</span>
                        <span> VND</span>
                      </span>
                    </div>
                  )}

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
                      <button
                        onClick={() => onUpdateQuantity(mockupData.id, -1, productId)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm active:scale-75 transition-transform"
                        aria-label="Giảm số lượng"
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
                          className="lucide lucide-minus-icon lucide-minus text-gray-600"
                        >
                          <path d="M5 12h14" />
                        </svg>
                      </button>
                      <span className="w-8 text-center font-semibold text-sm">{quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(mockupData.id, 1, productId)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm active:scale-75 transition-transform"
                        aria-label="Tăng số lượng"
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
                          className="lucide lucide-plus-icon lucide-plus text-gray-600"
                        >
                          <path d="M5 12h14" />
                          <path d="M12 5v14" />
                        </svg>
                      </button>
                    </div>
                    <div>
                      <button
                        onClick={() => onRemoveProduct(productId, productVariantId, mockupData.id)}
                        className="p-1 rounded-full bg-red-600 hover:scale-90 transition"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-x-icon lucide-x text-white"
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
          </div>
        )
      )}
    </section>
  )
}
