import { hardCodedPrintTemplates } from '@/configs/print-template/templates-data'
import { getInitialContants } from '@/utils/contants'
import {
  TPlacedImage,
  TPlacedImageMetaData,
  TPrintedImage,
  TPrintTemplate,
  TSizeInfo,
  TTemplateFrame,
} from '@/utils/types/global'
import {
  assignFrameSizeByTemplateType,
  stylePlacedImageByTemplateType,
} from '@/configs/print-template/templates-helpers'

export const initFramePlacedImageByPrintedImage = (
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
    prrintedImageWidth: printedImage.width,
    printedImageHeight: printedImage.height,
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
    assignFrameSizeByTemplateType(
      { width: printAreaWidth, height: printAreaHeight },
      '2-vertical',
      frame
    )
  }
  const template2Horizon = hardCodedPrintTemplates('2-horizon') // ưu tiên: ảnh vuông
  for (const frame of template2Horizon.frames) {
    assignFrameSizeByTemplateType(
      { width: printAreaWidth, height: printAreaHeight },
      '2-horizon',
      frame
    )
  }
  const template1Square = hardCodedPrintTemplates('1-square') // ưu tiên: ảnh dọc, ảnh vuông
  for (const frame of template1Square.frames) {
    assignFrameSizeByTemplateType(
      { width: printAreaWidth, height: printAreaHeight },
      '1-square',
      frame
    )
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

export const matchBestPrintedImageToTemplate = (
  template: TPrintTemplate,
  printedImages: TPrintedImage[]
): void => {
  let templatePoint: number = 0
  for (const image of printedImages) {
    let point: number = 0
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
      console.log('>>> match:', { match, frame, image, template })
      if (match) {
        point += frame.width > frame.height ? frame.width : frame.height
      }
      if (point > templatePoint) {
        frame.placedImage = initFramePlacedImageByPrintedImage(frame.index, image)
      }
    }
  }
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

type TCleanPrintAreaResult = {
  printAreaContainer: HTMLDivElement | null
  allowedPrintArea: HTMLDivElement | null
  removeMockPrintArea: () => void
}

export const cleanPrintAreaOnExtractMockupImage = (
  printAreaContainer: HTMLDivElement
): TCleanPrintAreaResult => {
  const clonedPrintAreaContainer = printAreaContainer.cloneNode(true) as HTMLDivElement
  clonedPrintAreaContainer.style.position = 'absolute'
  clonedPrintAreaContainer.style.zIndex = '-10'
  clonedPrintAreaContainer.style.top = '0'
  clonedPrintAreaContainer.style.left = '0'
  clonedPrintAreaContainer.style.boxSizing = 'border-box'
  clonedPrintAreaContainer.style.width = `${printAreaContainer.getBoundingClientRect().width}px`
  clonedPrintAreaContainer.style.height = `${printAreaContainer.getBoundingClientRect().height}px`
  document.body.prepend(clonedPrintAreaContainer)
  clonedPrintAreaContainer
    .querySelector<HTMLElement>('.NAME-out-of-bounds-overlay-warning')
    ?.remove()
  const allowedPrintArea = clonedPrintAreaContainer.querySelector<HTMLDivElement>(
    '.NAME-print-area-allowed'
  )
  allowedPrintArea?.style.setProperty('border', 'none')
  allowedPrintArea?.style.setProperty('background-color', 'transparent')
  const framesDisplayer = allowedPrintArea?.querySelector<HTMLElement>(
    '.NAME-frames-add-image-displayer'
  )
  framesDisplayer?.style.setProperty('background-color', 'transparent')
  framesDisplayer?.style.setProperty('border', 'none')
  for (const frame of allowedPrintArea?.querySelectorAll<HTMLElement>('.NAME-template-frame') ||
    []) {
    frame.style.setProperty('border', 'none')
    frame.querySelector<HTMLElement>('.NAME-plus-icon-wrapper')?.remove()
  }
  return {
    printAreaContainer: clonedPrintAreaContainer,
    allowedPrintArea: allowedPrintArea,
    removeMockPrintArea: () => {
      clonedPrintAreaContainer?.remove()
    },
  }
}

export const diffPrintedImageFromShapeSize = (
  frameSize: TSizeInfo,
  printedImageSize: TSizeInfo
): number => {
  const imgRatio = printedImageSize.width / printedImageSize.height
  const upSquareDiff = 1 + getInitialContants<number>('MAX_DIFF_RATIO_VALUE')
  const downSquareDiff = 1 - getInitialContants<number>('MAX_DIFF_RATIO_VALUE')
  const { width, height } = frameSize
  if (width < height) {
    if (imgRatio < downSquareDiff) return 0
    return 1 - imgRatio
  } else if (width > height) {
    if (imgRatio > upSquareDiff) return 0
    return imgRatio - 1
  }
  if (imgRatio >= downSquareDiff && imgRatio <= upSquareDiff) return 0
  return Math.abs(1 - imgRatio)
}

export const matchPrintedImageToShapeSize = (
  frameSize: TSizeInfo,
  printedImageSize: TSizeInfo
): boolean => {
  const { width: imgWidth, height: imgHeight } = printedImageSize
  const { width, height } = frameSize
  if (width < height) {
    return imgWidth < imgHeight
  } else if (width > height) {
    return imgWidth > imgHeight
  }
  return imgWidth === imgHeight
}

export const matchPrintedImgAndAllowSquareMatchToShapeSize = (
  frameSize: TSizeInfo,
  printedImageSize: TSizeInfo
): boolean => {
  const imgRatio = printedImageSize.width / printedImageSize.height
  const { width, height } = frameSize
  if (width < height) {
    return imgRatio <= 1
  } else if (width > height) {
    return imgRatio >= 1
  }
  return true
}

export const initPlacedImageStyle = (
  placedImageQuery: string = '.NAME-print-area-container .NAME-frame-placed-image',
  closestPlacedImageWrapperQuery: string = '.NAME-frame-placed-image-wrapper'
) => {
  requestAnimationFrame(() => {
    // Logic để điều chỉnh styles của ảnh đã đặt trong frame sau khi UI đã render xong
    for (const placedImage of document.body.querySelectorAll<HTMLImageElement>(placedImageQuery)) {
      const imgWrapper = placedImage.closest<HTMLElement>(closestPlacedImageWrapperQuery)
      if (imgWrapper) {
        const { width, height } = imgWrapper.getBoundingClientRect()
        if (width < height) {
          placedImage.style.width = 'auto'
          placedImage.style.height = '100%'
        } else {
          placedImage.style.width = '100%'
          placedImage.style.height = 'auto'
        }
      }
    }
  })
}

export const captureCurrentElementPosition = (
  element: HTMLElement,
  conatinerElementAbsoluteTo: HTMLElement
) => {
  const childRect = element.getBoundingClientRect()
  const parentRect = conatinerElementAbsoluteTo.getBoundingClientRect()

  // Lưu vị trí dưới dạng % so với parent
  const leftPercent = ((childRect.left - parentRect.left) / parentRect.width) * 100
  const topPercent = ((childRect.top - parentRect.top) / parentRect.height) * 100

  element.dataset.leftPercent = `${leftPercent}`
  element.dataset.topPercent = `${topPercent}`
}
