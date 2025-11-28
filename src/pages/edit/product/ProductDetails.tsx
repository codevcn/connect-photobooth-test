import { Modal } from '@/components/custom/common/Modal'
import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'
import { formatNumberWithCommas, friendlyCurrency, getContrastColor } from '@/utils/helpers'
import {
  TBaseProduct,
  TClientProductVariant,
  TColorAttribute,
  TMaterialAttribute,
  TScentAttribute,
  TSizeAttribute,
} from '@/utils/types/global'
import { useMemo, useState } from 'react'
import { PrintSurface } from '../print-surface/PrintSurface'

type TProductImagePreviewProps = {
  imageURL: string
  onClose: () => void
}

const ProductImagePreview = ({ imageURL, onClose }: TProductImagePreviewProps) => {
  return (
    <Modal
      onClose={onClose}
      title="Ảnh sản phẩm"
      classNames={{
        contentContainer: 'p-0 overflow-hidden w-fit',
        rootModal: 'z-99',
        titleContainer: 'py-1',
      }}
    >
      <div className="bg-white w-fit flex justify-center relative overflow-hidden">
        <img src={imageURL} alt="Ảnh sản phẩm" className="h-[calc(95vh-48px)] object-contain" />
      </div>
    </Modal>
  )
}

type TSizeChartPreviewProps = {
  setShowSizeChart: (show: boolean) => void
  sizeChartImageURL: string
}

const SizeChartPreview = ({ setShowSizeChart, sizeChartImageURL }: TSizeChartPreviewProps) => {
  return (
    <Modal
      onClose={() => setShowSizeChart(false)}
      title="Bảng kích thước"
      classNames={{
        contentContainer: 'p-0 overflow-y-auto',
        titleContainer: 'bg-secondary-cl text-white',
        board: 'max-w-2xl max-h-[90vh]',
      }}
    >
      <div className="bg-white w-full rounded-xl shadow-2xl border border-gray-200 relative">
        <div className="p-4">
          <div className="border border-slate-300 rounded-2xl p-6">
            <p className="text-center text-sm text-gray-800 font-medium mb-8">
              Có thể chênh lệch ±1.5 inch do đo thủ công và quy trình sản xuất
            </p>

            <div className="flex justify-center items-end gap-4 h-64 mb-8 relative">
              <div className="text-center w-full h-full flex items-center justify-center bg-yellow-50 rounded-lg border border-dashed border-orange-300 text-orange-400">
                <img
                  src={sizeChartImageURL}
                  alt="Bảng size"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

type TProductDetailsProps = {
  pickedProduct: TBaseProduct
  pickedVariant: TClientProductVariant
}

/**
 * Helper: Tìm variant khớp với attributes đã chọn
 */
const findVariantByAttributes = (
  variants: TClientProductVariant[],
  selectedAttrs: Record<string, string>
): TClientProductVariant | null => {
  return (
    variants.find((variant) => {
      const attrs = variant.attributes
      return (
        (!selectedAttrs.material || attrs.material === selectedAttrs.material) &&
        (!selectedAttrs.scent || attrs.scent === selectedAttrs.scent) &&
        (!selectedAttrs.color || attrs.color === selectedAttrs.color) &&
        (!selectedAttrs.size || attrs.size?.toUpperCase() === selectedAttrs.size?.toUpperCase())
      )
    }) || null
  )
}

export const ProductDetails = ({ pickedProduct, pickedVariant }: TProductDetailsProps) => {
  const [showSizeChart, setShowSizeChart] = useState(false)
  const [selectedImageToPreview, setSelectedImageToPreview] = useState<string>()
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({})
  const handlePickVariant = useProductUIDataStore((s) => s.handlePickVariant)

  const { mergedAttributes } = pickedProduct

  const firstProductImageURL = pickedProduct.detailImages[0] || null

  const hintForSizeChart: string = 'none'

  return (
    <div className="smd:order-1 smd:mt-0 mt-4 order-2 w-full">
      <div className="pl-1 pt-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{pickedProduct.name}</h1>
      </div>

      <div className="flex items-center space-x-3 pl-1">
        <span className="text-3xl text-orange-600">
          <span className="font-bold">
            {formatNumberWithCommas(pickedVariant.priceAmountOneSide)}
          </span>
          <span className="font-medium ml-1 text-2xl">
            {friendlyCurrency(pickedVariant.currency)}
          </span>
        </span>
      </div>

      <div className="p-3 smd:p-4 bg-orange-50 border border-orange-100 rounded-lg space-y-2 my-4">
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="text-gray-800 font-bold">Chăm sóc khách hàng</span>
          <span className="font-semibold text-orange-600 text-end whitespace-nowrap">
            0987 654 321
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm pl-1">
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

      <div className="mt-4 bg-gray-100 border-border rounded-lg overflow-hidden p-3">
        <div>
          <h3 className="block text-sm font-bold text-slate-900">Danh mục hình ảnh sản phẩm</h3>
          <div className="flex overflow-x-auto gap-2 w-full mt-2 gallery-scroll">
            {pickedProduct.detailImages.length > 0 ? (
              pickedProduct.detailImages.slice(1).map((imgURL) => (
                <div
                  key={imgURL}
                  className="bg-white mobile-touch cursor-pointer min-w-20 w-20 max-w-20 aspect-square"
                  onClick={() => setSelectedImageToPreview(imgURL)}
                >
                  <img src={imgURL} alt="Danh mục ảnh sản phẩm" />
                </div>
              ))
            ) : (
              <div
                onClick={() => setSelectedImageToPreview(pickedProduct.url)}
                className="bg-white mobile-touch cursor-pointer min-w-20 w-20 max-w-20 aspect-square"
              >
                <img src={pickedProduct.url} alt="Ảnh đại diện sản phẩm" />
              </div>
            )}
          </div>
        </div>

        {/* Material Section */}
        {mergedAttributes.materials && (
          <div className="rounded-lg mt-4">
            <h3 className="text-slate-800 font-bold text-sm mb-2">
              {mergedAttributes.materials.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              {mergedAttributes.materials.options.map((material) => {
                const isSelected = pickedVariant.attributes.material === material.value
                return (
                  <button
                    key={material.value}
                    onClick={() => {
                      const newAttrs = { ...selectedAttributes, material: material.value }
                      setSelectedAttributes(newAttrs)
                      const matchedVariant = findVariantByAttributes(
                        pickedProduct.variants,
                        newAttrs
                      )
                      if (matchedVariant) handlePickVariant(matchedVariant)
                    }}
                    className={`px-5 py-1 font-bold rounded-lg transition-all mobile-touch ${
                      isSelected
                        ? 'bg-main-cl border-2 border-main-cl text-white shadow-md'
                        : 'bg-white border-2 border-gray-300 text-slate-700 hover:border-secondary-cl hover:text-secondary-cl'
                    }`}
                  >
                    {material.displayValue}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Scent Section */}
        {mergedAttributes.scents && (
          <div className="rounded-lg mt-4">
            <h3 className="text-slate-800 font-bold text-sm mb-2">{mergedAttributes.scents.title}</h3>
            <div className="flex flex-wrap gap-2">
              {mergedAttributes.scents.options.map((scent) => {
                const isSelected = pickedVariant.attributes.scent === scent.value
                return (
                  <button
                    key={scent.value}
                    onClick={() => {
                      const newAttrs = { ...selectedAttributes, scent: scent.value }
                      setSelectedAttributes(newAttrs)
                      const matchedVariant = findVariantByAttributes(
                        pickedProduct.variants,
                        newAttrs
                      )
                      if (matchedVariant) handlePickVariant(matchedVariant)
                    }}
                    className={`px-5 py-1 font-bold rounded-lg transition-all mobile-touch ${
                      isSelected
                        ? 'bg-main-cl border-2 border-main-cl text-white shadow-md'
                        : 'bg-white border-2 border-gray-300 text-slate-700 hover:border-secondary-cl hover:text-secondary-cl'
                    }`}
                  >
                    {scent.displayValue}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Color Section */}
        {mergedAttributes.colors && (
          <div className="rounded-lg mt-4">
            <h3 className="text-slate-800 font-bold text-sm mb-2">{mergedAttributes.colors.title}</h3>
            <div className="flex flex-wrap gap-3">
              {mergedAttributes.colors.options.map((color) => {
                const isSelected = pickedVariant.attributes.color === color.value

                if (color.displayType === 'swatch' && color.hex) {
                  // Case 1: Display color swatch with hex
                  return (
                    <button
                      key={color.value}
                      onClick={() => {
                        const newAttrs = { ...selectedAttributes, color: color.value }
                        setSelectedAttributes(newAttrs)
                        const matchedVariant = findVariantByAttributes(
                          pickedProduct.variants,
                          newAttrs
                        )
                        if (matchedVariant) handlePickVariant(matchedVariant)
                      }}
                      className="flex flex-col items-center rounded-full focus:outline-none transition-all mobile-touch"
                      title={color.displayValue}
                    >
                      <div
                        style={{ backgroundColor: color.hex }}
                        className={`${
                          isSelected
                            ? 'ring-2 ring-main-cl ring-offset-2 shadow-lg'
                            : 'ring-1 ring-gray-300 ring-offset-2 hover:ring-secondary-cl hover:shadow-md'
                        } h-10 w-10 rounded-full cursor-pointer`}
                      >
                        {isSelected && (
                          <div className="w-full h-full rounded-full flex items-center justify-center">
                            <svg
                              className="w-5 h-5 drop-shadow-lg"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              style={{
                                color: getContrastColor(color.hex) || '#000',
                              }}
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div
                        className="text-[12px] font-medium rounded-md py-0.5 px-1.5 mt-2 inline-block"
                        style={{
                          backgroundColor: color.hex,
                          color: getContrastColor(color.hex) || '#000',
                        }}
                      >
                        {color.displayValue}
                      </div>
                    </button>
                  )
                } else {
                  // Case 2: Display as label (no hex)
                  return (
                    <button
                      key={color.value}
                      onClick={() => {
                        const newAttrs = { ...selectedAttributes, color: color.value }
                        setSelectedAttributes(newAttrs)
                        const matchedVariant = findVariantByAttributes(
                          pickedProduct.variants,
                          newAttrs
                        )
                        if (matchedVariant) handlePickVariant(matchedVariant)
                      }}
                      className={`px-5 py-1 font-bold rounded-lg transition-all mobile-touch ${
                        isSelected
                          ? 'bg-main-cl border-2 border-main-cl text-white shadow-md'
                          : 'bg-white border-2 border-gray-300 text-slate-700 hover:border-secondary-cl hover:text-secondary-cl'
                      }`}
                    >
                      {color.displayValue}
                    </button>
                  )
                }
              })}
            </div>
          </div>
        )}

        {/* Size Section */}
        {mergedAttributes.sizes && (
          <div className="mt-4">
            <div className="flex justify-between w-full mb-2">
              <label className="block text-sm font-bold text-slate-900">
                {mergedAttributes.sizes.title}
              </label>
              {firstProductImageURL && firstProductImageURL !== hintForSizeChart && (
                <button
                  onClick={() => setShowSizeChart(true)}
                  className="cursor-pointer mobile-touch text-main-cl underline text-sm font-medium hover:text-secondary-cl"
                >
                  Bảng size
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {mergedAttributes.sizes.options.map((size) => {
                const isSelected =
                  pickedVariant.attributes.size?.toUpperCase() === size.value.toUpperCase()
                // Find variant with this size to check stock
                const variantForSize = findVariantByAttributes(pickedProduct.variants, {
                  ...selectedAttributes,
                  size: size.value,
                })
                const isOutOfStock = !variantForSize || variantForSize.stock === 0

                return (
                  <button
                    key={size.value}
                    onClick={() => {
                      if (!isOutOfStock) {
                        const newAttrs = { ...selectedAttributes, size: size.value }
                        setSelectedAttributes(newAttrs)
                        const matchedVariant = findVariantByAttributes(
                          pickedProduct.variants,
                          newAttrs
                        )
                        if (matchedVariant) handlePickVariant(matchedVariant)
                      }
                    }}
                    disabled={isOutOfStock}
                    className={`px-5 py-1 font-bold rounded-lg transition-all mobile-touch ${
                      isOutOfStock
                        ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed line-through'
                        : isSelected
                        ? 'bg-main-cl border-2 border-main-cl text-white shadow-md'
                        : 'bg-white border-2 border-gray-300 text-slate-700 hover:border-secondary-cl hover:text-secondary-cl'
                    }`}
                  >
                    {size.displayValue}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <PrintSurface printSurfaces={pickedProduct.printAreaList} pickedVariant={pickedVariant} />
      </div>

      {showSizeChart && firstProductImageURL && firstProductImageURL !== hintForSizeChart && (
        <SizeChartPreview
          setShowSizeChart={setShowSizeChart}
          sizeChartImageURL={firstProductImageURL}
        />
      )}
      {selectedImageToPreview && (
        <ProductImagePreview
          imageURL={selectedImageToPreview}
          onClose={() => setSelectedImageToPreview(undefined)}
        />
      )}
    </div>
  )
}
