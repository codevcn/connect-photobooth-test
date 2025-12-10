import { createInitialConstants } from '@/utils/contants'
import { generateUniqueId } from '@/utils/helpers'
import { TLayoutSlotConfig, TLayoutType, TPrintLayout } from '@/utils/types/print-layout'
import { TPrintedImage, TPrintedImageVisualState, TSizeInfo } from '@/utils/types/global'
import { getSlotConfigs } from '@/configs/print-layout/print-layout-data'

// ============================================================================
// Types
// ============================================================================

type TMatchOrientation = 'width' | 'height'

type TLayoutCandidate = {
  type: TLayoutType
  elements: TPrintedImageVisualState[]
  wastedArea: number // Diện tích trống còn lại (càng nhỏ càng tốt)
  imageCount: number
}

type TPrintAreaDimensions = {
  width: number
  height: number
  area: number
  ratio: number
  offsetLeft: number
  offsetTop: number
}

type TScaledImageSize = TSizeInfo & {
  matchOrientation: TMatchOrientation
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Tạo một printed image element với visual state mặc định
 */
const createPrintedImageElement = (
  img: TPrintedImage,
  size: TScaledImageSize
): TPrintedImageVisualState => ({
  id: generateUniqueId(),
  path: img.url,
  position: { x: 0, y: 0 },
  angle: createInitialConstants<number>('ELEMENT_ROTATION'),
  scale: createInitialConstants<number>('ELEMENT_ZOOM'),
  zindex: createInitialConstants<number>('ELEMENT_ZINDEX'),
  mountType: 'from-layout',
  width: size.width,
  height: size.height,
  matchOrientation: size.matchOrientation,
})

/**
 * Lấy thông tin kích thước của print area
 */
const getPrintAreaDimensions = (
  allowedPrintArea: HTMLElement,
  printAreaPadding: number = 0
): TPrintAreaDimensions => {
  const paddedWidth: number = allowedPrintArea.offsetWidth - printAreaPadding * 2 // cho padding để tránh tràn ra ngoài
  const paddedHeight: number = allowedPrintArea.offsetHeight - printAreaPadding * 2 // cho padding để tránh tràn ra ngoài
  return {
    width: paddedWidth,
    height: paddedHeight,
    area: paddedWidth * paddedHeight,
    ratio: paddedWidth / paddedHeight,
    offsetLeft: allowedPrintArea.offsetLeft + printAreaPadding,
    offsetTop: allowedPrintArea.offsetTop + printAreaPadding,
  }
}

/**
 * Tính kích thước ảnh sau khi scale để fit vào container
 * @param imgRatio - Tỷ lệ width/height của ảnh gốc
 * @param containerWidth - Chiều rộng container
 * @param containerHeight - Chiều cao container
 */
const calculateScaledSize = (
  imgRatio: number,
  containerWidth: number,
  containerHeight: number
): TScaledImageSize => {
  const containerRatio = containerWidth / containerHeight

  if (imgRatio > containerRatio) {
    // Ảnh rộng hơn container -> fit theo width
    return {
      width: containerWidth,
      height: containerWidth / imgRatio,
      matchOrientation: 'width',
    }
  }
  // Ảnh cao hơn hoặc bằng container -> fit theo height
  return {
    width: containerHeight * imgRatio,
    height: containerHeight,
    matchOrientation: 'height',
  }
}

/**
 * Tính diện tích trống còn lại sau khi đặt ảnh
 */
const calculateWastedArea = (
  printAreaDimensions: TPrintAreaDimensions,
  scaledSize: TScaledImageSize,
  imageCount: number = 1
): number => {
  const usedArea = scaledSize.width * scaledSize.height * imageCount
  return printAreaDimensions.area - usedArea
}

// ============================================================================
// Layout Generators
// ============================================================================

/**
 * Tạo layout candidate cho 1 ảnh full
 */
const generateFullLayout = (
  img: TPrintedImage,
  printArea: TPrintAreaDimensions
): TLayoutCandidate => {
  const imgRatio = img.width / img.height
  const scaledSize = calculateScaledSize(imgRatio, printArea.width, printArea.height)

  return {
    type: 'full',
    elements: [createPrintedImageElement(img, scaledSize)],
    wastedArea: calculateWastedArea(printArea, scaledSize),
    imageCount: 1,
  }
}

/**
 * Tạo layout candidate cho 2 ảnh chia đôi theo chiều ngang (cạnh nhau)
 */
const generateHalfWidthLayout = (
  img: TPrintedImage,
  printArea: TPrintAreaDimensions
): TLayoutCandidate => {
  const imgRatio = img.width / img.height
  const halfWidth = printArea.width / 2
  const scaledSize = calculateScaledSize(imgRatio, halfWidth, printArea.height)

  const element = createPrintedImageElement(img, scaledSize)

  return {
    type: 'half-width',
    elements: [element, { ...element, id: generateUniqueId() }],
    wastedArea: calculateWastedArea(printArea, scaledSize, 2),
    imageCount: 2,
  }
}

/**
 * Tạo layout candidate cho 2 ảnh chia đôi theo chiều dọc (chồng lên nhau)
 */
const generateHalfHeightLayout = (
  img: TPrintedImage,
  printArea: TPrintAreaDimensions
): TLayoutCandidate => {
  const imgRatio = img.width / img.height
  const halfHeight = printArea.height / 2
  const scaledSize = calculateScaledSize(imgRatio, printArea.width, halfHeight)

  const element = createPrintedImageElement(img, scaledSize)

  return {
    type: 'half-height',
    elements: [element, { ...element, id: generateUniqueId() }],
    wastedArea: calculateWastedArea(printArea, scaledSize, 2),
    imageCount: 2,
  }
}

/**
 * Tạo layout candidate cho 3 ảnh: 2 ảnh nhỏ bên trái + 1 ảnh lớn bên phải
 * Layout: [small][small] [large]
 *         [small][small]
 */
const generateThreeLeftLayout = (
  img: TPrintedImage,
  printArea: TPrintAreaDimensions
): TLayoutCandidate => {
  const imgRatio = img.width / img.height
  const halfWidth = printArea.width / 2
  const halfHeight = printArea.height / 2

  // 2 ảnh nhỏ bên trái (mỗi ảnh chiếm 1/4 diện tích)
  const smallSize = calculateScaledSize(imgRatio, halfWidth, halfHeight)
  // 1 ảnh lớn bên phải (chiếm nửa phải)
  const largeSize = calculateScaledSize(imgRatio, halfWidth, printArea.height)

  const smallElement1 = createPrintedImageElement(img, smallSize)
  const smallElement2 = createPrintedImageElement(img, smallSize)
  const largeElement = createPrintedImageElement(img, largeSize)

  const usedArea = smallSize.width * smallSize.height * 2 + largeSize.width * largeSize.height

  return {
    type: '3-left',
    elements: [smallElement1, smallElement2, largeElement],
    wastedArea: printArea.area - usedArea,
    imageCount: 3,
  }
}

/**
 * Tạo layout candidate cho 3 ảnh: 1 ảnh lớn bên trái + 2 ảnh nhỏ bên phải
 * Layout: [large] [small]
 *         [large] [small]
 */
const generateThreeRightLayout = (
  img: TPrintedImage,
  printArea: TPrintAreaDimensions
): TLayoutCandidate => {
  const imgRatio = img.width / img.height
  const halfWidth = printArea.width / 2
  const halfHeight = printArea.height / 2

  // 1 ảnh lớn bên trái
  const largeSize = calculateScaledSize(imgRatio, halfWidth, printArea.height)
  // 2 ảnh nhỏ bên phải
  const smallSize = calculateScaledSize(imgRatio, halfWidth, halfHeight)

  const largeElement = createPrintedImageElement(img, largeSize)
  const smallElement1 = createPrintedImageElement(img, smallSize)
  const smallElement2 = createPrintedImageElement(img, smallSize)

  const usedArea = largeSize.width * largeSize.height + smallSize.width * smallSize.height * 2

  return {
    type: '3-right',
    elements: [largeElement, smallElement1, smallElement2],
    wastedArea: printArea.area - usedArea,
    imageCount: 3,
  }
}

/**
 * Tạo layout candidate cho 3 ảnh: 2 ảnh nhỏ trên + 1 ảnh lớn dưới
 * Layout: [small] [small]
 *         [   large    ]
 */
const generateThreeTopLayout = (
  img: TPrintedImage,
  printArea: TPrintAreaDimensions
): TLayoutCandidate => {
  const imgRatio = img.width / img.height
  const halfWidth = printArea.width / 2
  const halfHeight = printArea.height / 2

  // 2 ảnh nhỏ trên
  const smallSize = calculateScaledSize(imgRatio, halfWidth, halfHeight)
  // 1 ảnh lớn dưới
  const largeSize = calculateScaledSize(imgRatio, printArea.width, halfHeight)

  const smallElement1 = createPrintedImageElement(img, smallSize)
  const smallElement2 = createPrintedImageElement(img, smallSize)
  const largeElement = createPrintedImageElement(img, largeSize)

  const usedArea = smallSize.width * smallSize.height * 2 + largeSize.width * largeSize.height

  return {
    type: '3-top',
    elements: [smallElement1, smallElement2, largeElement],
    wastedArea: printArea.area - usedArea,
    imageCount: 3,
  }
}

/**
 * Tạo layout candidate cho 3 ảnh: 1 ảnh lớn trên + 2 ảnh nhỏ dưới
 * Layout: [   large    ]
 *         [small] [small]
 */
const generateThreeBottomLayout = (
  img: TPrintedImage,
  printArea: TPrintAreaDimensions
): TLayoutCandidate => {
  const imgRatio = img.width / img.height
  const halfWidth = printArea.width / 2
  const halfHeight = printArea.height / 2

  // 1 ảnh lớn trên
  const largeSize = calculateScaledSize(imgRatio, printArea.width, halfHeight)
  // 2 ảnh nhỏ dưới
  const smallSize = calculateScaledSize(imgRatio, halfWidth, halfHeight)

  const largeElement = createPrintedImageElement(img, largeSize)
  const smallElement1 = createPrintedImageElement(img, smallSize)
  const smallElement2 = createPrintedImageElement(img, smallSize)

  const usedArea = largeSize.width * largeSize.height + smallSize.width * smallSize.height * 2

  return {
    type: '3-bottom',
    elements: [largeElement, smallElement1, smallElement2],
    wastedArea: printArea.area - usedArea,
    imageCount: 3,
  }
}

/**
 * Tạo layout candidate cho 4 ảnh lưới 2x2
 * Layout: [1] [2]
 *         [3] [4]
 */
const generateFourSquareLayout = (
  img: TPrintedImage,
  printArea: TPrintAreaDimensions
): TLayoutCandidate => {
  const imgRatio = img.width / img.height
  const halfWidth = printArea.width / 2
  const halfHeight = printArea.height / 2

  const scaledSize = calculateScaledSize(imgRatio, halfWidth, halfHeight)

  const elements = Array.from({ length: 4 }, () => createPrintedImageElement(img, scaledSize))

  return {
    type: '4-square',
    elements,
    wastedArea: calculateWastedArea(printArea, scaledSize, 4),
    imageCount: 4,
  }
}

/**
 * Tạo layout candidate cho 4 ảnh ngang chồng lên nhau
 * Layout: [    1    ]
 *         [    2    ]
 *         [    3    ]
 *         [    4    ]
 */
const generateFourHorizonLayout = (
  img: TPrintedImage,
  printArea: TPrintAreaDimensions
): TLayoutCandidate => {
  const imgRatio = img.width / img.height
  const quarterHeight = printArea.height / 4

  const scaledSize = calculateScaledSize(imgRatio, printArea.width, quarterHeight)

  const elements = Array.from({ length: 4 }, () => createPrintedImageElement(img, scaledSize))

  return {
    type: '4-horizon',
    elements,
    wastedArea: calculateWastedArea(printArea, scaledSize, 4),
    imageCount: 4,
  }
}

/**
 * Tạo layout candidate cho 4 ảnh dọc nằm cạnh nhau
 * Layout: [1] [2] [3] [4]
 */
const generateFourVerticalLayout = (
  img: TPrintedImage,
  printArea: TPrintAreaDimensions
): TLayoutCandidate => {
  const imgRatio = img.width / img.height
  const quarterWidth = printArea.width / 4

  const scaledSize = calculateScaledSize(imgRatio, quarterWidth, printArea.height)

  const elements = Array.from({ length: 4 }, () => createPrintedImageElement(img, scaledSize))

  return {
    type: '4-vertical',
    elements,
    wastedArea: calculateWastedArea(printArea, scaledSize, 4),
    imageCount: 4,
  }
}

// ============================================================================
// Position Calculators
// ============================================================================

/**
 * Gán position cho các elements dựa trên layout type
 * Các ảnh sẽ nằm sát nhau (không có khoảng trống) và căn giữa trong print area
 */
const assignPositionsToElements = (
  layout: TLayoutCandidate,
  printArea: TPrintAreaDimensions
): void => {
  const { type, elements } = layout
  const { offsetLeft, offsetTop, width: areaWidth, height: areaHeight } = printArea

  switch (type) {
    case 'full': {
      const el = elements[0]
      // Căn giữa 1 ảnh trong print area
      el.position = {
        x: offsetLeft + (areaWidth - el.width!) / 2,
        y: offsetTop + (areaHeight - el.height!) / 2,
      }
      break
    }

    case 'half-width': {
      // 2 ảnh nằm cạnh nhau (sát nhau theo chiều ngang)
      const totalWidth = elements.reduce((sum, el) => sum + el.width!, 0)
      const totalHeight = Math.max(...elements.map((el) => el.height!))

      // Tính điểm bắt đầu để căn giữa cả nhóm ảnh
      const startX = offsetLeft + (areaWidth - totalWidth) / 2
      const startY = offsetTop + (areaHeight - totalHeight) / 2

      let currentX = startX
      for (const el of elements) {
        // Căn giữa theo chiều dọc cho từng ảnh (nếu chiều cao khác nhau)
        const verticalOffset = (totalHeight - el.height!) / 2
        el.position = {
          x: currentX,
          y: startY + verticalOffset,
        }
        currentX += el.width! // Ảnh tiếp theo nằm sát ngay sau
      }
      break
    }

    case 'half-height': {
      // 2 ảnh chồng lên nhau (sát nhau theo chiều dọc)
      const totalHeight = elements.reduce((sum, el) => sum + el.height!, 0)
      const totalWidth = Math.max(...elements.map((el) => el.width!))

      // Tính điểm bắt đầu để căn giữa cả nhóm ảnh
      const startX = offsetLeft + (areaWidth - totalWidth) / 2
      const startY = offsetTop + (areaHeight - totalHeight) / 2

      let currentY = startY
      for (const el of elements) {
        // Căn giữa theo chiều ngang cho từng ảnh (nếu chiều rộng khác nhau)
        const horizontalOffset = (totalWidth - el.width!) / 2
        el.position = {
          x: startX + horizontalOffset,
          y: currentY,
        }
        currentY += el.height! // Ảnh tiếp theo nằm sát ngay dưới
      }
      break
    }

    case '3-left': {
      // 2 ảnh nhỏ bên trái (chồng nhau) + 1 ảnh lớn bên phải
      const [small1, small2, large] = elements
      const leftWidth = Math.max(small1.width!, small2.width!)
      const leftHeight = small1.height! + small2.height!
      const totalWidth = leftWidth + large.width!
      const totalHeight = Math.max(leftHeight, large.height!)

      const startX = offsetLeft + (areaWidth - totalWidth) / 2
      const startY = offsetTop + (areaHeight - totalHeight) / 2

      // 2 ảnh nhỏ bên trái
      small1.position = {
        x: startX + (leftWidth - small1.width!) / 2,
        y: startY + (totalHeight - leftHeight) / 2,
      }
      small2.position = {
        x: startX + (leftWidth - small2.width!) / 2,
        y: small1.position.y + small1.height!,
      }
      // Ảnh lớn bên phải
      large.position = {
        x: startX + leftWidth,
        y: startY + (totalHeight - large.height!) / 2,
      }
      break
    }

    case '3-right': {
      // 1 ảnh lớn bên trái + 2 ảnh nhỏ bên phải (chồng nhau)
      const [large, small1, small2] = elements
      const rightWidth = Math.max(small1.width!, small2.width!)
      const rightHeight = small1.height! + small2.height!
      const totalWidth = large.width! + rightWidth
      const totalHeight = Math.max(large.height!, rightHeight)

      const startX = offsetLeft + (areaWidth - totalWidth) / 2
      const startY = offsetTop + (areaHeight - totalHeight) / 2

      // Ảnh lớn bên trái
      large.position = {
        x: startX,
        y: startY + (totalHeight - large.height!) / 2,
      }
      // 2 ảnh nhỏ bên phải
      small1.position = {
        x: startX + large.width! + (rightWidth - small1.width!) / 2,
        y: startY + (totalHeight - rightHeight) / 2,
      }
      small2.position = {
        x: startX + large.width! + (rightWidth - small2.width!) / 2,
        y: small1.position.y + small1.height!,
      }
      break
    }

    case '3-top': {
      // 2 ảnh nhỏ trên (cạnh nhau) + 1 ảnh lớn dưới
      const [small1, small2, large] = elements
      const topWidth = small1.width! + small2.width!
      const topHeight = Math.max(small1.height!, small2.height!)
      const totalWidth = Math.max(topWidth, large.width!)
      const totalHeight = topHeight + large.height!

      const startX = offsetLeft + (areaWidth - totalWidth) / 2
      const startY = offsetTop + (areaHeight - totalHeight) / 2

      // 2 ảnh nhỏ trên
      const topStartX = startX + (totalWidth - topWidth) / 2
      small1.position = {
        x: topStartX,
        y: startY + (topHeight - small1.height!) / 2,
      }
      small2.position = {
        x: topStartX + small1.width!,
        y: startY + (topHeight - small2.height!) / 2,
      }
      // Ảnh lớn dưới
      large.position = {
        x: startX + (totalWidth - large.width!) / 2,
        y: startY + topHeight,
      }
      break
    }

    case '3-bottom': {
      // 1 ảnh lớn trên + 2 ảnh nhỏ dưới (cạnh nhau)
      const [large, small1, small2] = elements
      const bottomWidth = small1.width! + small2.width!
      const bottomHeight = Math.max(small1.height!, small2.height!)
      const totalWidth = Math.max(large.width!, bottomWidth)
      const totalHeight = large.height! + bottomHeight

      const startX = offsetLeft + (areaWidth - totalWidth) / 2
      const startY = offsetTop + (areaHeight - totalHeight) / 2

      // Ảnh lớn trên
      large.position = {
        x: startX + (totalWidth - large.width!) / 2,
        y: startY,
      }
      // 2 ảnh nhỏ dưới
      const bottomStartX = startX + (totalWidth - bottomWidth) / 2
      small1.position = {
        x: bottomStartX,
        y: startY + large.height! + (bottomHeight - small1.height!) / 2,
      }
      small2.position = {
        x: bottomStartX + small1.width!,
        y: startY + large.height! + (bottomHeight - small2.height!) / 2,
      }
      break
    }

    case '4-square': {
      // 4 ảnh lưới 2x2
      const [el1, el2, el3, el4] = elements
      const row1Width = el1.width! + el2.width!
      const row2Width = el3.width! + el4.width!
      const col1Height = el1.height! + el3.height!
      const col2Height = el2.height! + el4.height!
      const totalWidth = Math.max(row1Width, row2Width)
      const totalHeight = Math.max(col1Height, col2Height)

      const startX = offsetLeft + (areaWidth - totalWidth) / 2
      const startY = offsetTop + (areaHeight - totalHeight) / 2

      // Row 1
      el1.position = { x: startX, y: startY }
      el2.position = { x: startX + el1.width!, y: startY }
      // Row 2
      el3.position = { x: startX, y: startY + el1.height! }
      el4.position = { x: startX + el3.width!, y: startY + el2.height! }
      break
    }

    case '4-horizon': {
      // 4 ảnh ngang chồng lên nhau
      const totalHeight = elements.reduce((sum, el) => sum + el.height!, 0)
      const totalWidth = Math.max(...elements.map((el) => el.width!))

      const startX = offsetLeft + (areaWidth - totalWidth) / 2
      const startY = offsetTop + (areaHeight - totalHeight) / 2

      let currentY = startY
      for (const el of elements) {
        el.position = {
          x: startX + (totalWidth - el.width!) / 2,
          y: currentY,
        }
        currentY += el.height!
      }
      break
    }

    case '4-vertical': {
      // 4 ảnh dọc nằm cạnh nhau
      const totalWidth = elements.reduce((sum, el) => sum + el.width!, 0)
      const totalHeight = Math.max(...elements.map((el) => el.height!))

      const startX = offsetLeft + (areaWidth - totalWidth) / 2
      const startY = offsetTop + (areaHeight - totalHeight) / 2

      let currentX = startX
      for (const el of elements) {
        el.position = {
          x: currentX,
          y: startY + (totalHeight - el.height!) / 2,
        }
        currentX += el.width!
      }
      break
    }
  }
}

// ============================================================================
// Main Algorithm
// ============================================================================

/**
 * Tìm layout tối ưu nhất cho printed images trong print area
 * Tiêu chí: Diện tích trống còn lại nhỏ nhất
 */
const findOptimalLayout = (
  printedImages: TPrintedImage[],
  printArea: TPrintAreaDimensions
): TLayoutCandidate => {
  if (printedImages.length === 0) {
    throw new Error('Không có ảnh để tạo layout.')
  }

  const allCandidates: TLayoutCandidate[] = []

  // Tạo tất cả layout candidates có thể từ mỗi ảnh
  for (const img of printedImages) {
    allCandidates.push(
      // 1 ảnh
      generateFullLayout(img, printArea),
      // 2 ảnh
      generateHalfWidthLayout(img, printArea),
      generateHalfHeightLayout(img, printArea),
      // 3 ảnh
      generateThreeLeftLayout(img, printArea),
      generateThreeRightLayout(img, printArea),
      generateThreeTopLayout(img, printArea),
      generateThreeBottomLayout(img, printArea),
      // 4 ảnh
      generateFourSquareLayout(img, printArea),
      generateFourHorizonLayout(img, printArea),
      generateFourVerticalLayout(img, printArea)
    )
  }

  // Chọn layout có wastedArea nhỏ nhất
  return allCandidates.reduce<TLayoutCandidate>((best, current) => {
    if (current.wastedArea < best.wastedArea) {
      return current
    }
    return best
  }, allCandidates[0])
}

// ============================================================================
// Public API
// ============================================================================

export type TBuildLayoutResult = {
  layout: TLayoutCandidate
  elements: TPrintedImageVisualState[]
}

/**
 * Build layout tối ưu cho printed images trong allowed print area
 * @returns Layout đã được tính position cho các elements, hoặc null nếu không có ảnh
 */
export const buildDefaultLayout = (
  _printAreaContainer: HTMLElement, // Reserved for future use (e.g., constraints, boundaries)
  allowedPrintArea: HTMLElement,
  printedImages: TPrintedImage[],
  printAreaPadding: number = 0,
  isLog: boolean = false
): TBuildLayoutResult => {
  const printArea = getPrintAreaDimensions(allowedPrintArea, printAreaPadding)
  const optimalLayout = findOptimalLayout(printedImages, printArea)

  // Gán position cho các elements
  assignPositionsToElements(optimalLayout, printArea)

  return {
    layout: optimalLayout,
    elements: optimalLayout.elements,
  }
}

// ============================================================================
// Slot Configuration for each Layout Type
// ============================================================================

/**
 * Tính wasted area khi đặt ảnh vào slot
 */
const calculateSlotWastedArea = (
  img: TPrintedImage,
  slotWidth: number,
  slotHeight: number
): number => {
  const imgRatio = img.width / img.height
  const scaledSize = calculateScaledSize(imgRatio, slotWidth, slotHeight)
  const slotArea = slotWidth * slotHeight
  const usedArea = scaledSize.width * scaledSize.height
  return slotArea - usedArea
}

/**
 * Tìm ảnh tốt nhất cho slot (ảnh có wasted area nhỏ nhất)
 * Không quan tâm ảnh đã được sử dụng cho slot khác hay chưa
 */
const findBestImageForSlot = (
  images: TPrintedImage[],
  slotWidth: number,
  slotHeight: number
): { image: TPrintedImage; wastedArea: number } | null => {
  if (images.length === 0) return null

  let bestImage: TPrintedImage = images[0]
  let minWastedArea = calculateSlotWastedArea(images[0], slotWidth, slotHeight)

  for (let i = 1; i < images.length; i++) {
    const img = images[i]
    const wastedArea = calculateSlotWastedArea(img, slotWidth, slotHeight)

    if (wastedArea < minWastedArea) {
      minWastedArea = wastedArea
      bestImage = img
    }
  }

  return { image: bestImage, wastedArea: minWastedArea }
}

export type TBuildLayoutByTypeResult = {
  layoutType: TLayoutType
  elements: TPrintedImageVisualState[]
  totalWastedArea: number
}

/**
 * Build layout theo layout type được chỉ định
 * Với mỗi slot, tìm ảnh có wasted area nhỏ nhất (không quan tâm ảnh đã dùng hay chưa)
 *
 * @param layoutType - Layout type muốn sử dụng
 * @param allowedPrintArea - Element chứa vùng in
 * @param printedImages - Danh sách ảnh có thể sử dụng
 * @param printAreaPadding - Padding của vùng in
 * @returns Layout với các elements đã được gán position
 */
export const buildLayoutByLayoutType = (
  layoutType: TLayoutType,
  allowedPrintArea: HTMLElement,
  printedImages: TPrintedImage[],
  printAreaPadding: number = 0
): TBuildLayoutByTypeResult => {
  if (printedImages.length === 0) {
    throw new Error('Không có ảnh để tạo layout.')
  }

  const printArea = getPrintAreaDimensions(allowedPrintArea, printAreaPadding)
  const slotConfigs = getSlotConfigs(layoutType)

  const elements: TPrintedImageVisualState[] = []
  let totalWastedArea = 0

  // Với mỗi slot, tìm ảnh có wasted area nhỏ nhất
  for (const slotConfig of slotConfigs) {
    const slotWidth = printArea.width * slotConfig.containerWidth
    const slotHeight = printArea.height * slotConfig.containerHeight

    const bestMatch = findBestImageForSlot(printedImages, slotWidth, slotHeight)

    if (!bestMatch) {
      throw new Error('Không tìm được ảnh phù hợp cho slot.')
    }

    totalWastedArea += bestMatch.wastedArea

    // Tạo element cho slot
    const imgRatio = bestMatch.image.width / bestMatch.image.height
    const scaledSize = calculateScaledSize(imgRatio, slotWidth, slotHeight)
    const element = createPrintedImageElement(bestMatch.image, scaledSize)

    elements.push(element)
  }

  // Tạo layout candidate để gán position
  const layoutCandidate: TLayoutCandidate = {
    type: layoutType,
    elements,
    wastedArea: totalWastedArea,
    imageCount: elements.length,
  }

  // Gán position cho các elements
  assignPositionsToElements(layoutCandidate, printArea)

  return {
    layoutType,
    elements,
    totalWastedArea,
  }
}

export const reAssignElementsByLayoutData = (
  layout: TPrintLayout,
  allowedPrintArea: HTMLElement,
  printAreaPadding: number = 0
): TPrintedImageVisualState[] => {
  const printAreaDimensions = getPrintAreaDimensions(allowedPrintArea, printAreaPadding)
  const elements: TPrintedImageVisualState[] = structuredClone(layout.printedImageElements)
  console.log('>>> [rea] re-assign:', { elements })

  const halfWidth = printAreaDimensions.width / 2
  const halfHeight = printAreaDimensions.height / 2
  const quarterWidth = printAreaDimensions.width / 4
  const quarterHeight = printAreaDimensions.height / 4

  // Helper function để tính lại kích thước cho element
  const recalculateElementSize = (
    element: TPrintedImageVisualState,
    containerWidth: number,
    containerHeight: number
  ) => {
    const imgRatio = element.width! / element.height!
    const scaledSize = calculateScaledSize(imgRatio, containerWidth, containerHeight)
    element.width = scaledSize.width
    element.height = scaledSize.height
    element.matchOrientation = scaledSize.matchOrientation
  }

  // Tính lại kích thước cho mỗi element dựa trên print area mới
  switch (layout.layoutType) {
    case 'full':
      for (const element of elements) {
        recalculateElementSize(element, printAreaDimensions.width, printAreaDimensions.height)
      }
      break

    case 'half-width':
      for (const element of elements) {
        recalculateElementSize(element, halfWidth, printAreaDimensions.height)
      }
      break

    case 'half-height':
      for (const element of elements) {
        recalculateElementSize(element, printAreaDimensions.width, halfHeight)
      }
      break

    case '3-left': {
      // 2 ảnh nhỏ bên trái (1/4) + 1 ảnh lớn bên phải (1/2 width x full height)
      const [small1, small2, large] = elements
      recalculateElementSize(small1, halfWidth, halfHeight)
      recalculateElementSize(small2, halfWidth, halfHeight)
      recalculateElementSize(large, halfWidth, printAreaDimensions.height)
      break
    }

    case '3-right': {
      // 1 ảnh lớn bên trái (1/2 width x full height) + 2 ảnh nhỏ bên phải (1/4)
      const [large, small1, small2] = elements
      recalculateElementSize(large, halfWidth, printAreaDimensions.height)
      recalculateElementSize(small1, halfWidth, halfHeight)
      recalculateElementSize(small2, halfWidth, halfHeight)
      break
    }

    case '3-top': {
      // 2 ảnh nhỏ trên (1/4) + 1 ảnh lớn dưới (full width x 1/2 height)
      const [small1, small2, large] = elements
      recalculateElementSize(small1, halfWidth, halfHeight)
      recalculateElementSize(small2, halfWidth, halfHeight)
      recalculateElementSize(large, printAreaDimensions.width, halfHeight)
      break
    }

    case '3-bottom': {
      // 1 ảnh lớn trên (full width x 1/2 height) + 2 ảnh nhỏ dưới (1/4)
      const [large, small1, small2] = elements
      recalculateElementSize(large, printAreaDimensions.width, halfHeight)
      recalculateElementSize(small1, halfWidth, halfHeight)
      recalculateElementSize(small2, halfWidth, halfHeight)
      break
    }

    case '4-square':
      // 4 ảnh lưới 2x2 (mỗi ảnh 1/4)
      for (const element of elements) {
        recalculateElementSize(element, halfWidth, halfHeight)
      }
      break

    case '4-horizon':
      // 4 ảnh ngang chồng nhau (full width x 1/4 height)
      for (const element of elements) {
        recalculateElementSize(element, printAreaDimensions.width, quarterHeight)
      }
      break

    case '4-vertical':
      // 4 ảnh dọc cạnh nhau (1/4 width x full height)
      for (const element of elements) {
        recalculateElementSize(element, quarterWidth, printAreaDimensions.height)
      }
      break
  }

  // Gán lại position cho các elements
  assignPositionsToElements(
    {
      type: layout.layoutType,
      elements: elements,
      wastedArea: 0,
      imageCount: elements.length,
    },
    printAreaDimensions
  )

  console.log('>>> [rea] re ass return:', {
    elements,
    layoutType: layout.layoutType,
  })

  return elements
}
