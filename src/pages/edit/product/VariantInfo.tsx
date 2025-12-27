import {
  checkIfMobileScreen,
  extractIntegerFromString,
  getContrastColor,
  sortSizes,
} from '@/utils/helpers'
import { TBaseProduct, TClientProductVariant } from '@/utils/types/global'
import { PrintSurface } from '../print-surface/PrintSurface'
import { Modal } from '@/components/custom/common/Modal'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'
import { CustomScrollbar } from '@/components/custom/CustomScrollbar'
import { ProductColors } from './ProductColors'

type TDisplayVariantInfoType = 'display-in-product-details' | 'display-in-middle-info-section'

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
        board: 'max-h-[85vh]',
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
  sizesByPrefix: string[][]
  displayVariantInfoType: TDisplayVariantInfoType
  pickSize: (isDisabled: boolean, size: string) => void
}

const SizesComponent = ({
  sortedSizes,
  selectedAttributes,
  mergedAttributes,
  displayVariantInfoType,
  sizesByPrefix,
  pickSize,
}: TSizesComponentProps) => {
  const greaterThanSingleSizes = sizesByPrefix.length > 1
  return sizesByPrefix.map((sizesGroup) => (
    <div
      className={`${
        displayVariantInfoType === 'display-in-middle-info-section' ? 'flex-nowrap' : 'flex-wrap'
      } flex gap-2`}
      key={sizesGroup[0].split(' ')[0]}
    >
      {sizesGroup.map((size) => {
        const isSelected = selectedAttributes.size?.toUpperCase() === size.toUpperCase()
        const isScopeDisabled = !mergedAttributes.groups?.[selectedAttributes.material ?? 'null']?.[
          selectedAttributes.scent ?? 'null'
        ]?.[selectedAttributes.color ?? 'null']?.sizes?.some((s) => s === size)
        const isDisabled = isScopeDisabled
        return (
          <Fragment key={size}>
            <button
              key={size}
              onClick={() => pickSize(isDisabled, size)}
              disabled={isDisabled}
              className={`5xl:py-2 5xl:px-4 px-3 min-w-max py-1 font-bold rounded-lg mobile-touch ${
                isDisabled
                  ? `bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed`
                  : isSelected
                  ? 'bg-main-cl border-2 border-main-cl text-white shadow-md'
                  : 'bg-white border-2 border-gray-300 text-slate-700 hover:border-secondary-cl hover:text-secondary-cl'
              }`}
            >
              {size}
            </button>
          </Fragment>
        )
      })}
      {greaterThanSingleSizes && <div className="w-full"></div>}
    </div>
  ))
}

type Item = {
  id: number
  name: string
}

type TVariantInfoProps = {
  pickedProduct: TBaseProduct
  pickedVariant: TBaseProduct['variants'][0]
  type: TDisplayVariantInfoType
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

  const [sortedSizes, sizesByPrefix] = useMemo<[string[], string[][]]>(() => {
    let isClothSize = true
    function groupByPrefixToArray(arr: string[], separator: string) {
      const map: Record<string, string[]> = {}
      for (const item of arr) {
        const prefix = item.split(separator)[0]
        ;(map[prefix] ||= []).push(item)
      }
      return Object.values(map)
    }

    function smartSort(arr: string[]) {
      // Thứ tự size quần áo
      const sizeOrder = [
        'XXS',
        'XS',
        'S',
        'M',
        'L',
        'XL',
        '2XL',
        '3XL',
        '4XL',
        '5XL',
        'XXL',
        'XXXL', // phòng trường hợp viết khác
      ]

      // Map size → index
      const sizeMap = new Map(sizeOrder.map((size, index) => [size.toUpperCase(), index]))

      return [...arr].sort((a, b) => {
        const A = a.toString().toUpperCase().trim()
        const B = b.toString().toUpperCase().trim()

        const aIsSize = sizeMap.has(A)
        const bIsSize = sizeMap.has(B)

        // Nếu cả 2 đều là size → sort theo size
        if (aIsSize && bIsSize) {
          return sizeMap.get(A)! - sizeMap.get(B)!
        }

        // Nếu chỉ 1 cái là size → size đứng trước
        if (aIsSize) return -1
        if (bIsSize) return 1

        // Cả 2 không phải size → thử extract số và so sánh
        isClothSize = false
        const parsedA = extractIntegerFromString(A)
        const parsedB = extractIntegerFromString(B)
        if (parsedA && parsedB) {
          return parsedB - parsedA
        }

        // Cả 2 không phải size → sort text bình thường
        return A.localeCompare(B, 'vi')
      })
    }
    const sorted = smartSort(mergedAttributes.uniqueSizes)
    let sizesByPrefix: string[][] = [sorted]
    if (!isClothSize) {
      if (pickedProduct.id === 21) {
        sizesByPrefix = groupByPrefixToArray(sorted, ' ')
      }
    }
    return [sorted, sizesByPrefix]
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
          <div className="NAME-material-variant-section mb-4">
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
        <div className="NAME-scent-variant-section mb-4">
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
                  className={`5xl:py-2 px-2 py-1 font-bold rounded-lg transition-all mobile-touch ${
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

      <ProductColors
        colorsCount={colorsCount}
        mergedAttributes={mergedAttributes}
        selectedAttributes={selectedAttributes}
        pickColor={pickColor}
      />

      {/* Size Section */}
      {sortedSizes.length > 0 && sortedSizes[0] !== 'null' && (
        <div className="NAME-size-variant-section">
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
                content: '5xl:text-[0.4em] smd:text-base text-sm flex flex-col pb-2 gap-2',
              }}
            >
              <SizesComponent
                mergedAttributes={mergedAttributes}
                pickSize={pickSize}
                selectedAttributes={selectedAttributes}
                sortedSizes={sortedSizes}
                sizesByPrefix={sizesByPrefix}
                displayVariantInfoType={type}
              />
            </CustomScrollbar>
          ) : (
            <div className="STYLE-styled-scrollbar 5xl:text-[0.4em] text-base flex flex-wrap max-h-80 overflow-y-auto pr-1">
              <SizesComponent
                mergedAttributes={mergedAttributes}
                pickSize={pickSize}
                selectedAttributes={selectedAttributes}
                sortedSizes={sortedSizes}
                sizesByPrefix={sizesByPrefix}
                displayVariantInfoType={type}
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
