import { createInitialConstants } from '@/utils/contants'
import { generateUniqueId } from '@/utils/helpers'
import { TLayoutType } from '@/utils/types/default-template'
import { TPrintedImage, TPrintedImageVisualState, TSizeInfo } from '@/utils/types/global'

// ============================================================================
// Types
// ============================================================================

type TMatchOrientation = 'width' | 'height'

// TODO: Mở rộng thêm các layout khác: 'quarter' | 'three-left' | 'three-right' | 'three-top' | 'three-bottom'

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
  mountType: 'from-template',
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
  const rect = allowedPrintArea.getBoundingClientRect()
  const paddedWidth: number = rect.width - printAreaPadding * 2 // cho padding để tránh tràn ra ngoài
  const paddedHeight: number = rect.height - printAreaPadding * 2 // cho padding để tránh tràn ra ngoài
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

// TODO: Thêm các layout generators khác
// const generateQuarterLayout = (imgs: TPrintedImage[], printArea: TPrintAreaDimensions): TLayoutCandidate
// const generateThreeLeftLayout = (imgs: TPrintedImage[], printArea: TPrintAreaDimensions): TLayoutCandidate
// const generateThreeRightLayout = (imgs: TPrintedImage[], printArea: TPrintAreaDimensions): TLayoutCandidate

// ============================================================================
// Position Calculators
// ============================================================================

/**
 * Tính position để căn giữa element trong container
 */
const calculateCenteredPosition = (
  elementSize: TSizeInfo,
  containerOffset: { left: number; top: number },
  containerSize: TSizeInfo
): { x: number; y: number } => ({
  x: containerOffset.left + (containerSize.width - elementSize.width) / 2,
  y: containerOffset.top + (containerSize.height - elementSize.height) / 2,
})

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

    // TODO: Thêm case cho các layout khác
    // case 'quarter': 4 ảnh sát nhau thành lưới 2x2
    // case 'three-left': 1 ảnh lớn bên trái + 2 ảnh nhỏ sát nhau bên phải
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
      generateFullLayout(img, printArea),
      generateHalfWidthLayout(img, printArea),
      generateHalfHeightLayout(img, printArea)
    )
  }

  // TODO: Khi cần hỗ trợ nhiều ảnh khác nhau trong 1 layout
  // Có thể thêm logic combine nhiều ảnh vào các layout 3-4 ảnh ở đây

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
export const buildDefaultTemplateLayout = (
  _printAreaContainer: HTMLElement, // Reserved for future use (e.g., constraints, boundaries)
  allowedPrintArea: HTMLElement,
  printedImages: TPrintedImage[],
  printAreaPadding: number = 0
): TBuildLayoutResult => {
  console.log('>>> [bui] params:', {
    allowedPrintArea,
    allowedPrintAreaRect: allowedPrintArea.getBoundingClientRect(),
  })
  const printArea = getPrintAreaDimensions(allowedPrintArea, printAreaPadding)
  const optimalLayout = findOptimalLayout(printedImages, printArea)

  // Gán position cho các elements
  assignPositionsToElements(optimalLayout, printArea)

  console.log('>>> [bui] Selected layout:', {
    type: optimalLayout.type,
    imageCount: optimalLayout.imageCount,
    wastedArea: optimalLayout.wastedArea.toFixed(2),
    elements: optimalLayout.elements,
  })

  return {
    layout: optimalLayout,
    elements: optimalLayout.elements,
  }
}

// TODO: Các hàm public khác có thể cần
// export const buildLayoutWithPreference = (preferredType: TLayoutType, ...) => { ... }
// export const buildLayoutForMultipleImages = (images: TPrintedImage[], ...) => { ... }
