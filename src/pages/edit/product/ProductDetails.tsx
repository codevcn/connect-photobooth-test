import { Modal } from '@/components/custom/common/Modal'
import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'
import { formatNumberWithCommas, friendlyCurrency, getContrastColor } from '@/utils/helpers'
import { TBaseProduct, TClientProductVariant } from '@/utils/types/global'
import { useEffect, useState } from 'react'
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
  selectedAttrs: Record<string, string>,
  onFound: (variant: TClientProductVariant | null) => void
): void => {
  setTimeout(() => {
    onFound(
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
  }, 0)
}

export const ProductDetails = ({ pickedProduct, pickedVariant }: TProductDetailsProps) => {
  const [showSizeChart, setShowSizeChart] = useState(false)
  const [selectedImageToPreview, setSelectedImageToPreview] = useState<string>()
  const handlePickVariant = useProductUIDataStore((s) => s.handlePickVariant)

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({})

  const initSelectedAttributesOnPickedVariantChange = () => {
    const attrs: Record<string, string> = {}
    if (pickedVariant.attributes.material) attrs.material = pickedVariant.attributes.material
    if (pickedVariant.attributes.scent) attrs.scent = pickedVariant.attributes.scent
    if (pickedVariant.attributes.color) attrs.color = pickedVariant.attributes.color
    if (pickedVariant.attributes.size) attrs.size = pickedVariant.attributes.size
    setSelectedAttributes(attrs)
  }

  useEffect(() => {
    initSelectedAttributesOnPickedVariantChange()
  }, [pickedVariant.id])

  const { mergedAttributes } = pickedProduct

  const firstProductImageURL = pickedProduct.detailImages[0] || null

  const hintForSizeChart: string = 'none'

  const pickMaterial = (material: string) => {
    // Reset dependent attributes when material changes
    const newAttrs = { material: material }
    setSelectedAttributes(newAttrs)
    findVariantByAttributes(pickedProduct.variants, newAttrs, (matchedVariant) => {
      if (matchedVariant) handlePickVariant(matchedVariant)
    })
  }

  const pickScent = (isDisabled: boolean, scent: string) => {
    if (!isDisabled) {
      // Reset dependent attributes (color, size) when scent changes
      const newAttrs = {
        material: selectedAttributes.material,
        scent: scent,
      }
      setSelectedAttributes(newAttrs)
      findVariantByAttributes(pickedProduct.variants, newAttrs, (matchedVariant) => {
        if (matchedVariant) handlePickVariant(matchedVariant)
      })
    }
  }

  const pickColor = (isDisabled: boolean, color: string) => {
    if (!isDisabled) {
      // Reset dependent attributes (size) when color changes
      const newAttrs = {
        material: selectedAttributes.material,
        scent: selectedAttributes.scent,
        color: color,
      }
      setSelectedAttributes(newAttrs)
      findVariantByAttributes(pickedProduct.variants, newAttrs, (matchedVariant) => {
        if (matchedVariant) handlePickVariant(matchedVariant)
      })
    }
  }

  const pickSize = (isDisabled: boolean, size: string) => {
    if (!isDisabled) {
      const newAttrs = {
        material: selectedAttributes.material,
        scent: selectedAttributes.scent,
        color: selectedAttributes.color,
        size: size,
      }
      setSelectedAttributes(newAttrs)
      findVariantByAttributes(pickedProduct.variants, newAttrs, (matchedVariant) => {
        if (matchedVariant) handlePickVariant(matchedVariant)
      })
    }
  }

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

      <div className="p-2 smd:p-3 bg-orange-50 border border-orange-100 rounded-lg space-y-2 my-4">
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="text-gray-800 font-bold">Chăm sóc khách hàng</span>
          <span className="font-semibold text-orange-600 text-end whitespace-nowrap">
            0987 654 321
          </span>
        </div>
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
        {mergedAttributes.uniqueMaterials.length > 0 &&
          mergedAttributes.uniqueMaterials[0] !== 'null' && (
            <div className="rounded-lg mt-4">
              <h3 className="text-slate-800 font-bold text-sm mb-2">
                {mergedAttributes.uniqueMaterialTitles[0]}
              </h3>
              <div className="flex flex-wrap gap-2">
                {mergedAttributes.uniqueMaterials.map((material: any) => {
                  const isSelected = selectedAttributes.material === material
                  return (
                    <button
                      key={material}
                      onClick={() => pickMaterial(material)}
                      className={`px-5 py-1 font-bold rounded-lg transition-all mobile-touch ${
                        isSelected
                          ? 'bg-main-cl border-2 border-main-cl text-white shadow-md'
                          : 'bg-white border-2 border-gray-300 text-slate-700 hover:border-secondary-cl hover:text-secondary-cl'
                      }`}
                    >
                      {material}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

        {/* Scent Section */}
        {mergedAttributes.uniqueScents.length > 0 &&
          mergedAttributes.uniqueScents[0] !== 'null' && (
            <div className="rounded-lg mt-4">
              <h3 className="text-slate-800 font-bold text-sm mb-2">
                {mergedAttributes.uniqueScentTitles[0]}
              </h3>
              <div className="flex flex-wrap gap-2">
                {mergedAttributes.uniqueScents.map((scent: any) => {
                  const isSelected = selectedAttributes.scent === scent
                  const isDisabled =
                    !mergedAttributes.groups?.[selectedAttributes.material ?? 'null']?.[
                      selectedAttributes.scent ?? 'null'
                    ]
                  return (
                    <button
                      key={scent}
                      onClick={() => pickScent(isDisabled, scent)}
                      disabled={isDisabled}
                      className={`px-5 py-1 font-bold rounded-lg transition-all mobile-touch ${
                        isDisabled
                          ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                          : isSelected
                          ? 'bg-main-cl border-2 border-main-cl text-white shadow-md'
                          : 'bg-white border-2 border-gray-300 text-slate-700 hover:border-secondary-cl hover:text-secondary-cl'
                      }`}
                    >
                      {scent}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

        {/* Color Section */}
        {Object.keys(mergedAttributes.uniqueColors).length > 0 &&
          Object.keys(mergedAttributes.uniqueColors)[0] !== 'null' && (
            <div className="rounded-lg mt-4">
              <h3 className="text-slate-800 font-bold text-sm mb-2">
                {mergedAttributes.uniqueColorTitles[0]}
              </h3>
              <div className="flex flex-wrap gap-3">
                {Object.keys(mergedAttributes.uniqueColors).map((color: any) => {
                  const isSelected = selectedAttributes.color === color
                  const material = selectedAttributes.material ?? 'null'
                  const scent = selectedAttributes.scent ?? 'null'
                  const isDisabled = !mergedAttributes.groups?.[material]?.[scent]?.[color]
                  if (mergedAttributes.uniqueColors[color]) {
                    // Case 1: Display color swatch with hex
                    return (
                      <button
                        key={color}
                        onClick={() => pickColor(isDisabled, color)}
                        disabled={isDisabled}
                        className={`flex flex-col items-center rounded-full focus:outline-none transition active:scale-90 ${
                          isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title={color}
                      >
                        <div
                          style={{ backgroundColor: mergedAttributes.uniqueColors[color] }}
                          className={`${
                            isDisabled
                              ? 'ring-1 ring-gray-300 ring-offset-2 grayscale'
                              : isSelected
                              ? 'ring-2 ring-main-cl ring-offset-2 shadow-lg'
                              : 'ring-1 ring-gray-300 ring-offset-2 hover:ring-secondary-cl hover:shadow-md'
                          } h-10 w-10 rounded-full`}
                        >
                          {isSelected && !isDisabled && (
                            <div className="w-full h-full rounded-full flex items-center justify-center">
                              <svg
                                className="w-5 h-5 drop-shadow-lg"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                style={{
                                  color:
                                    getContrastColor(mergedAttributes.uniqueColors[color]) ||
                                    '#000',
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
                          className={`text-[12px] font-medium rounded-md py-0.5 px-1.5 mt-2 inline-block ${
                            isDisabled ? 'grayscale' : ''
                          }`}
                          style={{
                            backgroundColor: mergedAttributes.uniqueColors[color],
                            color: getContrastColor(mergedAttributes.uniqueColors[color]) || '#000',
                          }}
                        >
                          {color}
                        </div>
                      </button>
                    )
                  } else {
                    // Case 2: Display as label (no hex)
                    return (
                      <button
                        key={color}
                        onClick={() => pickColor(isDisabled, color)}
                        disabled={isDisabled}
                        className={`px-5 py-1 font-bold rounded-lg transition-all mobile-touch ${
                          isDisabled
                            ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                            : isSelected
                            ? 'bg-main-cl border-2 border-main-cl text-white shadow-md'
                            : 'bg-white border-2 border-gray-300 text-slate-700 hover:border-secondary-cl hover:text-secondary-cl'
                        }`}
                      >
                        {color}
                      </button>
                    )
                  }
                })}
              </div>
            </div>
          )}

        {/* Size Section */}
        {mergedAttributes.uniqueSizes.length > 0 && mergedAttributes.uniqueSizes[0] !== 'null' && (
          <div className="mt-4">
            <div className="flex justify-between w-full mb-2">
              <label className="block text-sm font-bold text-slate-900">
                {mergedAttributes.uniqueSizeTitles[0]}
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
              {mergedAttributes.uniqueSizes.map((size) => {
                const isSelected = selectedAttributes.size?.toUpperCase() === size.toUpperCase()
                const isScopeDisabled = !mergedAttributes.groups?.[
                  selectedAttributes.material ?? 'null'
                ]?.[selectedAttributes.scent ?? 'null']?.[
                  selectedAttributes.color ?? 'null'
                ]?.sizes?.some((s) => s === size)
                const isDisabled = isScopeDisabled
                return (
                  <button
                    key={size}
                    onClick={() => pickSize(isDisabled, size)}
                    disabled={isDisabled}
                    className={`px-5 py-1 font-bold rounded-lg transition-all mobile-touch ${
                      isDisabled
                        ? `bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed`
                        : isSelected
                        ? 'bg-main-cl border-2 border-main-cl text-white shadow-md'
                        : 'bg-white border-2 border-gray-300 text-slate-700 hover:border-secondary-cl hover:text-secondary-cl'
                    }`}
                  >
                    {size}
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
