import { hardCodedPrintTemplates } from '@/configs/data/print-template'
import { getInitialContants } from '@/utils/contants'
import { matchPrintedImageToShapeSize } from '@/utils/helpers'
import {
  TPlacedImage,
  TPrintedImage,
  TPrintTemplate,
  TSizeInfo,
  TTemplateFrame,
} from '@/utils/types/global'

const initFramePlacedImageByPrintedImage = (
  frameIndexProperty: TTemplateFrame['index'],
  printedImage: TPrintedImage
): TPlacedImage => {
  return {
    id: printedImage.id,
    imgURL: printedImage.url,
    placementState: {
      frameIndex: frameIndexProperty,
      objectFit: getInitialContants('PLACED_IMG_OBJECT_FIT'),
      squareRotation: getInitialContants('PLACED_IMG_SQUARE_ROTATION'),
      zoom: getInitialContants('PLACED_IMG_ZOOM'),
      direction: getInitialContants('PLACED_IMG_DIRECTION'),
    },
  }
}

const assignFallbackTemplateToPrintArea = (printAreaInfo: TSizeInfo): TPrintTemplate => {
  const { width, height } = printAreaInfo
  if (width < height) {
    return hardCodedPrintTemplates('2-horizon')
  } else if (width > height) {
    return hardCodedPrintTemplates('2-vertical')
  }
  return hardCodedPrintTemplates('1-square')
}

const handleFallbackTemplate = (
  templates: TPrintTemplate,
  printedImage: TPrintedImage
): TPrintTemplate => {
  for (const frame of templates.frames) {
    frame.placedImage = initFramePlacedImageByPrintedImage(frame.index, printedImage)
  }
  return templates
}

const assignTemplatesToPrintArea = (
  printAreaWidth: TSizeInfo['width'],
  printAreaHeight: TSizeInfo['height']
): TPrintTemplate[] => {
  const template2Vertical = hardCodedPrintTemplates('2-vertical') // ưu tiên: ảnh vuông, ảnh dọc
  for (const frame of template2Vertical.frames) {
    frame.width = printAreaWidth / 2
    frame.height = printAreaHeight
  }
  const template2Horizon = hardCodedPrintTemplates('2-horizon') // ưu tiên: ảnh vuông
  for (const frame of template2Horizon.frames) {
    frame.width = printAreaWidth
    frame.height = printAreaHeight / 2
  }
  const template1Square = hardCodedPrintTemplates('1-square') // ưu tiên: ảnh dọc, ảnh vuông
  for (const frame of template1Square.frames) {
    frame.width = printAreaWidth
    frame.height = printAreaHeight
  }
  return [template2Vertical, template2Horizon, template1Square]
}

const handleSquareLikePrintedImage = (
  printAreaWidth: TSizeInfo['width'],
  printAreaHeight: TSizeInfo['height'],
  printedImage: TPrintedImage,
  isFourSquareImages: boolean = false
): TPrintTemplate | null => {
  if (
    printedImage.width / printedImage.height > 0.75 &&
    printedImage.width / printedImage.height < 1.25
  ) {
    const template = isFourSquareImages
      ? hardCodedPrintTemplates('4-square')
      : hardCodedPrintTemplates('1-square')
    for (const frame of template.frames) {
      frame.width = printAreaWidth
      frame.height = printAreaHeight
      frame.placedImage = initFramePlacedImageByPrintedImage(frame.index, printedImage)
    }
    return template
  }
  return null
}

const handleCroppedFourSquarePrintedImages = (
  printAreaWidth: TSizeInfo['width'],
  printAreaHeight: TSizeInfo['height'],
  printedImages: TPrintedImage[]
): TPrintTemplate | null => {
  let squareLikeImagesCount = 0
  for (const img of printedImages) {
    if (!img.isOriginalImage && img.width === img.height) {
      squareLikeImagesCount += 1
    }
  }
  if (squareLikeImagesCount === 4) {
    return handleSquareLikePrintedImage(printAreaWidth, printAreaHeight, printedImages[0], true)
  }
  return null
}

const handleOtherShapePrintedImages = (
  printAreaWidth: TSizeInfo['width'],
  printAreaHeight: TSizeInfo['height'],
  printedImages: TPrintedImage[]
): TPrintTemplate | null => {
  const templates = assignTemplatesToPrintArea(printAreaWidth, printAreaHeight)
  let foundTemplate: TPrintTemplate | null = null
  // ảnh có kích thước lớn nhất phải ở đầu tiên trong danh sách
  for (const image of printedImages) {
    // ảnh bự nhất đặt ở đầu
    let frameDimensionPoint: number = 0
    for (const template of templates) {
      let point = 0
      for (const frame of template.frames) {
        const match = matchPrintedImageToShapeSize(
          {
            width: frame.width,
            height: frame.height,
          },
          {
            height: image.height,
            width: image.width,
          }
        )
        if (match) {
          frame.placedImage = initFramePlacedImageByPrintedImage(frame.index, image)
          point += frame.width > frame.height ? frame.width : frame.height
        }
      }
      if (point > frameDimensionPoint) {
        frameDimensionPoint = point
        foundTemplate = template
      }
    }
    if (foundTemplate) {
      return foundTemplate
    }
  }
  return null
}

export const initTheBestTemplateForPrintedImages = (
  printAreaSize: TSizeInfo,
  printedImages: TPrintedImage[]
): TPrintTemplate => {
  const { width: printAreaWidth, height: printAreaHeight } = printAreaSize
  const bigestSizeImage = printedImages[0]
  // xử lý trường hợp 4 ảnh vuông đã bị crop
  const croppedFourSquareTemplate = handleCroppedFourSquarePrintedImages(
    printAreaWidth,
    printAreaHeight,
    printedImages
  )
  if (croppedFourSquareTemplate) {
    return croppedFourSquareTemplate
  }
  // xử lý trường hợp ảnh của user là ảnh gần giống hình vuông
  const squareLikeFirstImageTemplate = handleSquareLikePrintedImage(
    printAreaWidth,
    printAreaHeight,
    bigestSizeImage
  )
  if (squareLikeFirstImageTemplate) {
    return squareLikeFirstImageTemplate
  }
  // xử lý các trường hợp còn lại
  const otherShapeTemplate = handleOtherShapePrintedImages(
    printAreaWidth,
    printAreaHeight,
    printedImages
  )
  if (otherShapeTemplate) {
    return otherShapeTemplate
  }
  // trả về template đầu tiên nếu không tìm thấy cái nào phù hợp
  return handleFallbackTemplate(assignFallbackTemplateToPrintArea(printAreaSize), printedImages[0])
}
