import { hardCodedPrintTemplates } from '@/configs/print-template/templates-data'
import { createInitialConstants } from '@/utils/contants'
import {
  TPlacedImage,
  TPlacedImageMetaData,
  TPrintedImage,
  TPrintTemplate,
  TShapeOrientationType,
  TSizeInfo,
  TTemplateFrame,
  TTemplateType,
} from '@/utils/types/global'
import {
  assignFrameSizeByTemplateType,
  stylePlacedImageByTemplateType,
} from '@/configs/print-template/templates-helpers'
import { generateUniqueId } from '@/utils/helpers'
import { useEditedElementStore } from '@/stores/element/element.store'
import { TPrintLayout } from '@/utils/types/print-layout'
import { useElementLayerStore } from '@/stores/ui/element-layer.store'
import { reAssignElementsByLayoutData } from './customize/print-layout/builder'

export const initFramePlacedImageByPrintedImage = (
  frameIndexProperty: TTemplateFrame['index'],
  printedImage: TPrintedImage
): TPlacedImage => {
  return {
    id: generateUniqueId(),
    imgURL: printedImage.url,
    placementState: {
      frameIndex: frameIndexProperty,
      objectFit: createInitialConstants('PLACED_IMG_OBJECT_FIT'),
      squareRotation: createInitialConstants('PLACED_IMG_SQUARE_ROTATION'),
      zoom: createInitialConstants('PLACED_IMG_ZOOM'),
      direction: createInitialConstants('PLACED_IMG_DIRECTION'),
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
  removeMockPrintArea: () => void
}

export const cleanPrintAreaOnExtractMockupImage = (
  printAreaContainer: HTMLDivElement
): TCleanPrintAreaResult => {
  const wrapper = printAreaContainer.closest<HTMLElement>('.NAME-print-area-container-wrapper')!
  const clonedPrintAreaContainer = printAreaContainer.cloneNode(true) as HTMLDivElement
  clonedPrintAreaContainer.style.transform = 'none'
  clonedPrintAreaContainer.style.position = 'absolute'
  clonedPrintAreaContainer.style.top = '0'
  clonedPrintAreaContainer.style.left = '0'
  clonedPrintAreaContainer.style.boxSizing = 'border-box'
  clonedPrintAreaContainer.style.width = `${wrapper.getBoundingClientRect().width}px`
  clonedPrintAreaContainer.style.height = `${wrapper.getBoundingClientRect().height}px`
  document.body
    .querySelector<HTMLElement>('.NAME-app-temp-container')
    ?.appendChild(clonedPrintAreaContainer)
  clonedPrintAreaContainer
    .querySelector<HTMLElement>('.NAME-out-of-bounds-overlay-warning')
    ?.remove()
  clonedPrintAreaContainer
    .querySelector<HTMLElement>('.NAME-zoom-placed-image-btn-wrapper')
    ?.remove()
  const clonedAllowedPrintArea = clonedPrintAreaContainer.querySelector<HTMLDivElement>(
    '.NAME-print-area-allowed'
  )
  clonedAllowedPrintArea?.style.setProperty('border', 'none')
  clonedAllowedPrintArea?.style.setProperty('background-color', 'transparent')
  const clonedFramesDisplayer = clonedAllowedPrintArea?.querySelector<HTMLElement>(
    '.NAME-frames-add-image-displayer'
  )
  clonedFramesDisplayer?.style.setProperty('background-color', 'transparent')
  clonedFramesDisplayer?.style.setProperty('border', 'none')
  for (const frame of clonedAllowedPrintArea?.querySelectorAll<HTMLElement>(
    '.NAME-template-frame'
  ) || []) {
    frame.style.setProperty('border', 'none')
    frame.querySelector<HTMLElement>('.NAME-plus-icon-wrapper')?.remove()
  }
  return {
    printAreaContainer: clonedPrintAreaContainer,
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
  const upSquareDiff = 1 + createInitialConstants<number>('MAX_DIFF_RATIO_VALUE')
  const downSquareDiff = 1 - createInitialConstants<number>('MAX_DIFF_RATIO_VALUE')
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

export const assignMockFrameSizeToTemplate = (
  templateShapeType: TShapeOrientationType,
  templateType: TTemplateType,
  frame: TTemplateFrame
) => {
  const template = hardCodedPrintTemplates(templateType)
  const templateH: number = createInitialConstants<number>('MOCK_TEMPLATE_HEIGHT_BY_TEMPLATE_TYPE')
  const templateW: number = templateH
  let defaultFrameW = templateW
  let defaultFrameH = templateH
  switch (templateType) {
    case '2-horizon':
      defaultFrameH = templateH / 2
      break
    case '2-vertical':
      defaultFrameW = templateW / 2
      break
    case '3-left':
      if (frame.index === 2) {
        defaultFrameW = templateW / 2
      } else {
        defaultFrameW = templateW / 2
        defaultFrameH = templateH / 2
      }
      break
    case '3-right':
      if (frame.index === 1) {
        defaultFrameW = templateW / 2
      } else {
        defaultFrameW = templateW / 2
        defaultFrameH = templateH / 2
      }
      break
    case '3-top':
      if (frame.index === 3) {
        defaultFrameH = templateH / 2
      } else {
        defaultFrameW = templateW / 2
        defaultFrameH = templateH / 2
      }
      break
    case '3-bottom':
      if (frame.index === 1) {
        defaultFrameH = templateH / 2
      } else {
        defaultFrameW = templateW / 2
        defaultFrameH = templateH / 2
      }
      break
    case '4-square':
      defaultFrameW = templateW / 2
      defaultFrameH = templateH / 2
      break
    case '4-horizon':
      defaultFrameH = templateH / 4
      break
    case '4-vertical':
      defaultFrameW = templateW / 4
      break
  }
  frame.width = defaultFrameW
  frame.height = defaultFrameH
}

export const adjustSizeOfPlacedImageOnPlaced = () => {
  const imagesDisplayer = document.querySelector<HTMLElement>(
    '.NAME-print-area-allowed .NAME-placed-images-displayer'
  )
  if (!imagesDisplayer) return
  const adjust = () => {
    const images = imagesDisplayer.querySelectorAll<HTMLImageElement>('.NAME-frame-placed-image')
    images.forEach((img) => {
      if (img.complete) fix(img)
      else img.onload = () => fix(img)
    })
  }
  adjust()

  function fix(img: HTMLImageElement) {
    if (img['NAME_isSizeAdjusted']) return
    const { width, height } = img.getBoundingClientRect()
    if (width === 0 || height === 0) return requestAnimationFrame(() => fix(img))
    img.style.width = width + 'px'
    img.style.height = height + 'px'
    const frame = img.closest<HTMLElement>('.NAME-template-frame')
    if (frame) {
      frame.style.width = width + 'px'
      frame.style.height = height + 'px'
    }
  }
}

export const cancelSelectingZoomingImages = () => {
  // ko cần truy vấn từ container vì element nằm ngay trên body
  for (const el of document.body.querySelectorAll<HTMLElement>(
    '.NAME-zoom-placed-image-btn-wrapper'
  )) {
    el.classList.add('hidden')
  }
}

export const handlePutPrintedImagesInLayout = (
  layout: TPrintLayout,
  allowedPrintArea: HTMLElement
) => {
  console.log('>>> [uuu] inputs:', { layout, allowedPrintArea })
  console.trace('[uuu] trace:')
  const printedImages = reAssignElementsByLayoutData(
    structuredClone(layout),
    allowedPrintArea,
    createInitialConstants('LAYOUT_PADDING')
  )
  const imageVisualStates = printedImages.map((img) => {
    return { ...img, isInitWithLayout: true }
  })
  useEditedElementStore.getState().initBuiltPrintedImageElements(imageVisualStates)
  useElementLayerStore.getState().removeImageLayoutElements()
  useElementLayerStore.getState().addElementLayers(
    imageVisualStates.map((visualState) => ({
      elementId: visualState.id,
      index: visualState.zindex,
      elementType: 'printed-image',
      isLayoutImage: true,
    }))
  )
}
