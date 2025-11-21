import { Modal } from '@/components/custom/common/Modal'
import { VietnamFlag } from '@/components/custom/icons/VietnamFlag'
import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'
import { formatNumberWithCommas, friendlyCurrency } from '@/utils/helpers'
import { TBaseProduct, TClientProductVariant, TProductColor } from '@/utils/types/global'
import { useEffect, useMemo, useState } from 'react'

type TProductDetailsProps = {
  pickedProduct: TBaseProduct
  pickedVariant: TClientProductVariant
}

export const ProductDetails = ({ pickedProduct, pickedVariant }: TProductDetailsProps) => {
  const [showSizeChart, setShowSizeChart] = useState(false)
  const { size: selectedSize, color: selectedColor } = pickedVariant
  const handlePickColor = useProductUIDataStore((s) => s.handlePickColor)
  const handlePickSize = useProductUIDataStore((s) => s.handlePickSize)

  // Lấy danh sách màu unique từ variants
  const availableColors = useMemo(() => {
    const colorMap = new Map<string, TProductColor>()
    for (const variant of pickedProduct.variants) {
      if (!colorMap.has(variant.color.value)) {
        colorMap.set(variant.color.value, variant.color)
      }
    }
    return Array.from(colorMap.values())
  }, [pickedProduct])

  // Lấy danh sách size có sẵn cho màu đã chọn
  const availableSizesForColor = useMemo(() => {
    return pickedProduct.variants.filter((v) => v.color.value === pickedVariant.color.value)
  }, [pickedProduct, pickedVariant])

  return (
    <div className="w-full">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{pickedProduct.name}</h1>
      </div>

      <div className="flex items-center space-x-3">
        <span className="text-3xl text-orange-600">
          <span className="font-bold">
            {formatNumberWithCommas(pickedVariant.priceAmountOneSide)}
          </span>
          <span className="font-medium ml-1 text-2xl">
            {friendlyCurrency(pickedVariant.currency)}
          </span>
        </span>
      </div>

      <div className="bg-orange-50 border border-orange-100 rounded-lg space-y-2 p-4 my-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Người bán</span>
          <span className="font-semibold text-gray-900">Photoism</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-800 font-bold">Chăm sóc khách hàng</span>
          <span className="font-semibold text-orange-600 hover:text-pink-hover-cl transition-colors">
            0987 654 321
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        {pickedVariant.stock > 0 ? (
          <>
            <span className="flex items-center gap-1 font-medium text-orange-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Còn hàng
            </span>
            <span className="text-gray-500">
              • <span>{pickedVariant.stock}</span> sản phẩm
            </span>
          </>
        ) : (
          <span className="flex items-center gap-1 font-medium text-red-600">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            Hết hàng
          </span>
        )}
      </div>

      <div className="space-y-3 text-sm mt-2">
        <div className="flex items-center">
          <div className="mr-2 text-lg">
            <VietnamFlag />
          </div>
          <div>
            <span className="text-gray-600">Vận chuyển đến </span>
            <span className="font-bold">Vietnam</span>
          </div>
        </div>
      </div>

      <div className="bg-white py-4 px-2 rounded-lg border-border mt-4">
        <h3 className="text-slate-800 font-bold text-lg mb-3">Màu sắc</h3>

        <div className="flex flex-wrap gap-3">
          {availableColors.map((color) => {
            const isSelected = selectedColor.value === color.value
            return (
              <button
                key={color.value}
                onClick={() => handlePickColor(color)}
                style={{ backgroundColor: color.value }}
                className={`w-10 h-10 rounded-full focus:outline-none transition-all mobile-touch ${
                  isSelected
                    ? 'ring-2 ring-main-cl ring-offset-2 shadow-lg'
                    : 'ring-1 ring-gray-300 ring-offset-2 hover:ring-secondary-cl hover:shadow-md'
                }`}
                aria-label={`Select ${color.title}`}
                title={color.title}
              >
                {isSelected && (
                  <div className="w-full h-full rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white drop-shadow-lg"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {pickedVariant && (
          <p className="text-sm text-gray-600 mt-4">
            <span className="font-medium">Đã chọn:</span>{' '}
            <span className="font-semibold text-slate-800">{selectedColor.title}</span>
          </p>
        )}
      </div>

      <div className="mt-4">
        <div className="flex justify-between w-full mb-2">
          <label className="block text-sm font-bold text-slate-900">Kích thước</label>
          <button
            onClick={() => setShowSizeChart(true)}
            className="cursor-pointer mobile-touch text-main-cl underline text-sm font-medium hover:text-secondary-cl"
          >
            Bảng size
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableSizesForColor.length > 0 ? (
            availableSizesForColor.map((variant) => {
              const isSelected = selectedSize === variant.size
              const isOutOfStock = variant.stock === 0
              return (
                <button
                  key={variant.id}
                  onClick={() => !isOutOfStock && handlePickSize(selectedColor, variant.size)}
                  disabled={isOutOfStock}
                  className={`px-5 py-1 font-bold rounded-lg transition-all mobile-touch ${
                    isOutOfStock
                      ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed line-through'
                      : isSelected
                      ? 'bg-main-cl border-2 border-main-cl text-white shadow-md'
                      : 'bg-white border-2 border-gray-300 text-slate-700 hover:border-secondary-cl hover:text-secondary-cl'
                  }`}
                >
                  {variant.size}
                </button>
              )
            })
          ) : (
            <p className="text-sm text-gray-500 italic">Vui lòng chọn màu sắc</p>
          )}
        </div>
      </div>

      {showSizeChart && (
        <Modal
          onClose={() => setShowSizeChart(false)}
          title="Bảng kích thước"
          classNames={{
            contentContainer: 'p-0 overflow-y-auto',
            titleContainer: 'bg-secondary-cl text-white',
            board: 'max-w-2xl',
          }}
        >
          <div className="bg-white w-full rounded-xl shadow-2xl border border-gray-200 relative">
            <div className="p-4">
              <div className="border border-slate-300 rounded-2xl p-6">
                <p className="text-center text-sm text-gray-800 font-medium mb-8">
                  Có thể chênh lệch ±1.5 inch do đo thủ công và quy trình sản xuất
                </p>

                <div className="flex justify-center items-end gap-4 h-64 mb-8 relative">
                  <div className="text-center opacity-50 w-full h-full flex items-center justify-center bg-yellow-50 rounded-lg border border-dashed border-orange-300 text-orange-400">
                    [Khu vực dành cho hình ảnh Silhouettes: Phụ nữ, Nam, Trẻ em, Em bé]
                  </div>
                </div>

                <div className="space-y-4 text-sm text-gray-800 font-medium text-center">
                  <p className="pb-4 border-b border-gray-200">
                    Vòng ngực - Đo ngang ngực cách nách 1 inch khi đặt áo nằm phẳng.
                  </p>
                  <p className="pb-4 border-b border-gray-200">
                    Vòng ngực nữ - Đo cách nách 1 inch.
                  </p>
                  <p>Chiều dài áo - Đo từ điểm cao nhất của vai phía sau.</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
