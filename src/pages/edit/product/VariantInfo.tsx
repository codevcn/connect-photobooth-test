import { getContrastColor, sortSizes } from '@/utils/helpers'
import { TBaseProduct, TClientProductVariant } from '@/utils/types/global'
import { PrintSurface } from '../print-surface/PrintSurface'
import { Modal } from '@/components/custom/common/Modal'
import { useEffect, useMemo, useState } from 'react'
import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'
import { CustomScrollbar } from '@/components/custom/CustomScrollbar'

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
        titleContainer: '5xl:text-4xl text-xl bg-secondary-cl text-white py-2',
        board: 'max-h-[98vh]',
      }}
    >
      <div className="bg-white w-full rounded-xl shadow-2xl border border-gray-200 relative">
        <div className="p-3">
          <div className="border border-slate-300 rounded-2xl p-2">
            <p className="5xl:text-[0.5em] text-center text-sm text-gray-800 font-medium mb-4">
              Có thể chênh lệch ±1.5 inch do đo thủ công và quy trình sản xuất
            </p>

            <div className="flex justify-center items-end gap-4 relative">
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

/**
 * Helper: Tìm variant khớp với attributes đã chọn
 */
const findVariantByAttributes = (
  variants: TClientProductVariant[],
  selectedAttrs: Record<string, string>,
  onFound: (variant: TClientProductVariant | null) => void
): void => {
  setTimeout(() => {
    let foundVariant = null
    const { material, scent, color, size } = selectedAttrs
    for (const variant of variants) {
      const attrs = variant.attributes
      if (material && material === attrs.material) {
        foundVariant = variant
      }
      if (scent && scent === attrs.scent && material === attrs.material) {
        foundVariant = variant
      }
      if (color && color === attrs.color && scent === attrs.scent && material === attrs.material) {
        foundVariant = variant
      }
      if (
        size &&
        size.toUpperCase() === attrs.size?.toUpperCase() &&
        color === attrs.color &&
        scent === attrs.scent &&
        material === attrs.material
      ) {
        foundVariant = variant
        break
      }
    }
    onFound(foundVariant)
  }, 0)
}

type TSizesComponentProps = {
  sortedSizes: string[]
  selectedAttributes: Record<string, string>
  mergedAttributes: TBaseProduct['mergedAttributes']
  pickSize: (isDisabled: boolean, size: string) => void
}

const SizesComponent = ({
  sortedSizes,
  selectedAttributes,
  mergedAttributes,
  pickSize,
}: TSizesComponentProps) => {
  return sortedSizes.map((size) => {
    const isSelected = selectedAttributes.size?.toUpperCase() === size.toUpperCase()
    const isScopeDisabled = !mergedAttributes.groups?.[selectedAttributes.material ?? 'null']?.[
      selectedAttributes.scent ?? 'null'
    ]?.[selectedAttributes.color ?? 'null']?.sizes?.some((s) => s === size)
    const isDisabled = isScopeDisabled
    return (
      <button
        key={size}
        onClick={() => pickSize(isDisabled, size)}
        disabled={isDisabled}
        className={`5xl:py-2 px-2 min-w-max py-1 font-bold rounded-lg transition-all mobile-touch ${
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
  })
}

type TVariantInfoProps = {
  pickedProduct: TBaseProduct
  pickedVariant: TBaseProduct['variants'][0]
  type: 'display-in-product-details' | 'display-in-middle-info-section'
}

export const VariantInfo = ({ pickedProduct, pickedVariant, type }: TVariantInfoProps) => {
  const [showSizeChart, setShowSizeChart] = useState(false)
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({})
  const [selectedImageToPreview, setSelectedImageToPreview] = useState<string>()
  const handlePickVariant = useProductUIDataStore((s) => s.handlePickVariant)

  const initSelectedAttributesOnPickedVariantChange = () => {
    const attrs: Record<string, string> = {}
    const variantAttrs = pickedVariant.attributes || {}
    if (variantAttrs.material) attrs.material = variantAttrs.material
    if (variantAttrs.scent) attrs.scent = variantAttrs.scent
    if (variantAttrs.color) attrs.color = variantAttrs.color
    if (variantAttrs.size) attrs.size = variantAttrs.size
    setSelectedAttributes(attrs)
  }

  useEffect(() => {
    initSelectedAttributesOnPickedVariantChange()
  }, [pickedVariant.id])

  const firstProductImageURL = pickedProduct.detailImages[0] || null

  const mergedAttributes = pickedProduct.mergedAttributes
  const hintForSizeChart: string = 'none'

  const sortedSizes: string[] = useMemo(() => {
    return sortSizes(mergedAttributes.uniqueSizes)
  }, [mergedAttributes])

  const pickMaterial = (material: string) => {
    // Reset dependent attributes when material changes
    const newAttrs = {
      material: material,
      scent: selectedAttributes.scent,
      color: selectedAttributes.color,
      size: selectedAttributes.size,
    }
    findVariantByAttributes(pickedProduct.variants, newAttrs, (matchedVariant) => {
      if (matchedVariant) {
        setSelectedAttributes(newAttrs)

        handlePickVariant(matchedVariant)
      }
    })
  }

  const pickScent = (isDisabled: boolean, scent: string) => {
    if (!isDisabled) {
      // Reset dependent attributes (color, size) when scent changes
      const newAttrs = {
        material: selectedAttributes.material,
        scent: scent,
        color: selectedAttributes.color,
        size: selectedAttributes.size,
      }
      findVariantByAttributes(pickedProduct.variants, newAttrs, (matchedVariant) => {
        if (matchedVariant) {
          setSelectedAttributes(newAttrs)
          handlePickVariant(matchedVariant)
        }
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
        size: selectedAttributes.size,
      }

      findVariantByAttributes(pickedProduct.variants, newAttrs, (matchedVariant) => {
        if (matchedVariant) {
          setSelectedAttributes(newAttrs)
          handlePickVariant(matchedVariant)
        }
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
        if (matchedVariant) {
          setSelectedAttributes(newAttrs)
          handlePickVariant(matchedVariant)
        }
      })
    }
  }

  const colorsCount = Object.keys(mergedAttributes.uniqueColors).length

  return (
    <div className="smd:order-4 mt-1 order-1 bg-gray-100 border-border rounded-lg overflow-hidden p-3 w-full">
      {/* <div className="smd:block hidden mb-4">
        <h3 className="5xl:text-[0.5em] block text-sm font-bold text-slate-900">
          Danh mục hình ảnh sản phẩm
        </h3>
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
        <p className="5xl:text-[0.4em] flex justify-center items-center w-full text-gray-600 font-bold text-[0.9em] mt-3 italic">
          Hiển thị hình ảnh người mặc áo
        </p>
      </div> */}

      {/* Material Section */}
      {mergedAttributes.uniqueMaterials.length > 0 &&
        mergedAttributes.uniqueMaterials[0] !== 'null' && (
          <div className="mb-4">
            <h3 className="5xl:text-[0.5em] text-sm text-slate-800 font-bold mb-2">
              {mergedAttributes.uniqueMaterialTitles[0]}
            </h3>
            <div className="5xl:text-[0.4em] smd:text-base text-sm flex flex-wrap gap-2">
              {mergedAttributes.uniqueMaterials.map((material) => {
                const isSelected = selectedAttributes.material === material
                return (
                  <button
                    key={material}
                    onClick={() => pickMaterial(material)}
                    className={`5xl:py-3 px-2 py-1 font-bold rounded-lg transition-all mobile-touch ${
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
      {mergedAttributes.uniqueScents.length > 0 && mergedAttributes.uniqueScents[0] !== 'null' && (
        <div className="mb-4">
          <h3 className="5xl:text-[0.5em] text-sm text-slate-800 font-bold mb-2">
            {mergedAttributes.uniqueScentTitles[0]}
          </h3>
          <div className=" 5xl:text-[0.4em] smd:text-base text-sm flex flex-wrap gap-2">
            {mergedAttributes.uniqueScents.map((scent) => {
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
                  className={`5xl:py-3 px-2 py-1 font-bold rounded-lg transition-all mobile-touch ${
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
      {colorsCount > 0 && Object.keys(mergedAttributes.uniqueColors)[0] !== 'null' && (
        <div className="mb-4">
          <h3 className="5xl:text-[0.5em] text-sm text-slate-800 font-bold mb-2">
            <span>{mergedAttributes.uniqueColorTitles[0]}</span>
            <span className="5xl:text-[0.4em] text-xs"> ({selectedAttributes.color})</span>
          </h3>
          <CustomScrollbar
            showScrollbar={colorsCount > 0}
            dataToRerender={colorsCount}
            classNames={{
              container:
                '5xl:text-[0.4em] smd:text-base text-sm font-bold py-2 w-full overflow-x-hidden',
              content: 'flex flex-nowrap gap-3 overflow-x-auto no-scrollbar p-1 pb-2',
            }}
          >
            {Object.keys(mergedAttributes.uniqueColors).map((color) => {
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
                    className={`5xl:py-2 flex flex-col items-center rounded-full focus:outline-none transition active:scale-90 ${
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
                            strokeWidth="3"
                            style={{
                              color:
                                getContrastColor(mergedAttributes.uniqueColors[color]) || '#000',
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
                    {/* <div
                      className={`rounded-md py-0.5 px-1.5 mt-2 inline-block w-max ${
                        isDisabled ? 'grayscale' : ''
                      }`}
                      style={{
                        backgroundColor: mergedAttributes.uniqueColors[color],
                        color: getContrastColor(mergedAttributes.uniqueColors[color]) || '#000',
                      }}
                    >
                      {color}
                    </div> */}
                  </button>
                )
              } else {
                // Case 2: Display as label (no hex)
                return (
                  <button
                    key={color}
                    onClick={() => pickColor(isDisabled, color)}
                    disabled={isDisabled}
                    className={`5xl:py-2 px-2 py-1 font-bold rounded-lg transition-all mobile-touch ${
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
          </CustomScrollbar>
        </div>
      )}

      {/* Size Section */}
      {sortedSizes.length > 0 && sortedSizes[0] !== 'null' && (
        <div className="">
          <div className="flex justify-between w-full mb-2">
            <label className="5xl:text-[0.5em] text-sm block font-bold text-slate-900">
              {mergedAttributes.uniqueSizeTitles[0]}
            </label>
            {firstProductImageURL && firstProductImageURL !== hintForSizeChart && (
              <button
                onClick={() => setShowSizeChart(true)}
                className="5xl:text-[0.4em] text-sm cursor-pointer mobile-touch text-main-cl underline font-medium hover:text-secondary-cl"
              >
                Bảng size
              </button>
            )}
          </div>

          {type === 'display-in-middle-info-section' ? (
            <CustomScrollbar
              classNames={{
                container: 'flex flex-nowrap gap-2 w-full',
                content: '5xl:text-[0.4em] smd:text-base text-sm flex flex-nowrap pb-3 gap-2',
              }}
            >
              <SizesComponent
                mergedAttributes={mergedAttributes}
                pickSize={pickSize}
                selectedAttributes={selectedAttributes}
                sortedSizes={sortedSizes}
              />
            </CustomScrollbar>
          ) : (
            <div className="5xl:text-[0.4em] text-base flex flex-wrap gap-2">
              <SizesComponent
                mergedAttributes={mergedAttributes}
                pickSize={pickSize}
                selectedAttributes={selectedAttributes}
                sortedSizes={sortedSizes}
              />
            </div>
          )}
        </div>
      )}

      <PrintSurface printSurfaces={pickedProduct.printSurfaces} pickedVariant={pickedVariant} />

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
