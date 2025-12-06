import { createInitialConstants } from '@/utils/contants'
import { generateUniqueId } from '@/utils/helpers'
import { TPrintedImage, TPrintedImageVisualState, TSizeInfo } from '@/utils/types/global'

const createPrintedImageElement = (
  img: TPrintedImage,
  imgSize: TSizeInfo,
  matchOrientation: 'width' | 'height'
): TPrintedImageVisualState => {
  return {
    id: generateUniqueId(),
    path: img.url,
    position: {
      x: 0,
      y: 0,
    },
    angle: createInitialConstants<number>('ELEMENT_ROTATION'),
    scale: createInitialConstants<number>('ELEMENT_ZOOM'),
    zindex: createInitialConstants<number>('ELEMENT_ZINDEX'),
    mountType: 'from-template',
    width: imgSize.width,
    height: imgSize.height,
    matchOrientation,
  }
}

type TArrangeType = 'full' | 'half-width' | 'half-height'

const arrangePrintedImagesInAllowedPrintArea = (
  printAreaContainer: HTMLElement,
  allowedPrintArea: HTMLElement,
  arrangeType: TArrangeType,
  printedImageVisualStates: TPrintedImageVisualState[]
) => {
  const allowedPrintAreaRect = allowedPrintArea.getBoundingClientRect()
  if (arrangeType === 'full') {
    for (const printedImageVisualState of printedImageVisualStates) {
      if (printedImageVisualState.matchOrientation === 'width') {
        printedImageVisualState.position = {
          x: allowedPrintArea.offsetLeft,
          y:
            allowedPrintArea.offsetTop +
            allowedPrintArea.offsetHeight / 2 -
            printedImageVisualState.height! / 2,
        }
      } else {
        printedImageVisualState.position = {
          x:
            allowedPrintArea.offsetLeft +
            allowedPrintArea.offsetWidth / 2 -
            printedImageVisualState.width! / 2,
          y: allowedPrintArea.offsetTop,
        }
      }
    }
  } else if (arrangeType === 'half-width') {
  }
}

const selectBestImagesByAllowedPrintArea = (
  printAreaContainer: HTMLElement,
  allowedPrintArea: HTMLElement,
  printedImages: TPrintedImage[]
): TPrintedImageVisualState[] => {
  const allowedPrintAreaRect = allowedPrintArea.getBoundingClientRect()
  const printAreaWidth = allowedPrintAreaRect.width
  const printAreaHeight = allowedPrintAreaRect.height
  let arrangeType: TArrangeType = 'full'
  let printedImageVisualStates: TPrintedImageVisualState[] = []
  let point: number = Infinity
  for (const img of printedImages) {
    const imgWidth = img.width
    const imgHeight = img.height
    const imgRatio = imgWidth / imgHeight
    const area = printAreaWidth * printAreaHeight

    if (imgRatio > printAreaWidth / printAreaHeight) {
      // 1 ảnh - full width
      const imgWidthForFullWidth = printAreaWidth
      const imgHeightForFullWidth = imgWidthForFullWidth / imgRatio
      const areaLeftForFullWidth = area - imgWidthForFullWidth * imgHeightForFullWidth
      if (areaLeftForFullWidth < point) {
        point = areaLeftForFullWidth
        printedImageVisualStates = [
          createPrintedImageElement(
            img,
            {
              width: imgWidthForFullWidth,
              height: imgHeightForFullWidth,
            },
            'width'
          ),
        ]
      }
    } else {
      // 1 ảnh - full height
      const imgHeightForFullHeight = printAreaHeight
      const imgWidthForFullHeight = imgHeightForFullHeight * imgRatio
      const areaLeftForFullHeight = area - imgWidthForFullHeight * imgHeightForFullHeight
      if (areaLeftForFullHeight < point) {
        point = areaLeftForFullHeight
        printedImageVisualStates = [
          createPrintedImageElement(
            img,
            {
              width: imgWidthForFullHeight,
              height: imgHeightForFullHeight,
            },
            'height'
          ),
        ]
      }
    }
    // 2 ảnh - half width
    if (imgRatio > printAreaWidth / 2 / printAreaHeight) {
      const imgWidthForHalfWidth = printAreaWidth / 2
      const imgHeightForHalfWidth = imgWidthForHalfWidth / imgRatio
      const areaLeftForHalfWidth = area - imgWidthForHalfWidth * imgHeightForHalfWidth * 2
      if (areaLeftForHalfWidth < point) {
        arrangeType = 'half-width'
        point = areaLeftForHalfWidth
        printedImageVisualStates = [
          createPrintedImageElement(
            img,
            {
              width: imgWidthForHalfWidth,
              height: imgHeightForHalfWidth,
            },
            'width'
          ),
          createPrintedImageElement(
            img,
            {
              width: imgWidthForHalfWidth,
              height: imgHeightForHalfWidth,
            },
            'width'
          ),
        ]
      }
    } else {
      // nếu ảnh thấp hơn thì tính theo chiều cao
      const imgHeightForHalfWidth = printAreaHeight
      const imgWidthForHalfWidth = imgHeightForHalfWidth * imgRatio
      const areaLeftForHalfWidth = area - imgWidthForHalfWidth * imgHeightForHalfWidth * 2
      if (areaLeftForHalfWidth < point) {
        arrangeType = 'half-width'
        point = areaLeftForHalfWidth
        printedImageVisualStates = [
          createPrintedImageElement(
            img,
            {
              width: imgWidthForHalfWidth,
              height: imgHeightForHalfWidth,
            },
            'height'
          ),
          createPrintedImageElement(
            img,
            {
              width: imgWidthForHalfWidth,
              height: imgHeightForHalfWidth,
            },
            'height'
          ),
        ]
      }
    }
    // 2 ảnh - half height
    if (imgRatio > printAreaWidth / printAreaHeight / 2) {
      const imgWidthForHalfHeight = printAreaWidth
      const imgHeightForHalfHeight = imgWidthForHalfHeight / imgRatio
      const areaLeftForHalfHeight = area - imgWidthForHalfHeight * imgHeightForHalfHeight * 2
      if (areaLeftForHalfHeight < point) {
        arrangeType = 'half-height'
        point = areaLeftForHalfHeight
        printedImageVisualStates = [
          createPrintedImageElement(
            img,
            {
              width: imgWidthForHalfHeight,
              height: imgHeightForHalfHeight,
            },
            'width'
          ),
          createPrintedImageElement(
            img,
            {
              width: imgWidthForHalfHeight,
              height: imgHeightForHalfHeight,
            },
            'width'
          ),
        ]
      }
    } else {
      // nếu ảnh rộng hơn thì tính theo chiều cao
      const imgHeightForHalfHeight = printAreaHeight / 2
      const imgWidthForHalfHeight = imgHeightForHalfHeight * imgRatio
      const areaLeftForHalfHeight = area - imgWidthForHalfHeight * imgHeightForHalfHeight * 2
      if (areaLeftForHalfHeight < point) {
        arrangeType = 'half-height'
        point = areaLeftForHalfHeight
        printedImageVisualStates = [
          createPrintedImageElement(
            img,
            {
              width: imgWidthForHalfHeight,
              height: imgHeightForHalfHeight,
            },
            'height'
          ),
          createPrintedImageElement(
            img,
            {
              width: imgWidthForHalfHeight,
              height: imgHeightForHalfHeight,
            },
            'height'
          ),
        ]
      }
    }
  }
  console.log('>>> [alg] pre return:', printedImageVisualStates)
  return printedImageVisualStates
}

export const buildDefaultTemplateLayout = (
  printAreaContainer: HTMLElement,
  allowedPrintArea: HTMLElement,
  printedImages: TPrintedImage[]
) => {
  const printedImagesVisualStates = selectBestImagesByAllowedPrintArea(
    printAreaContainer,
    allowedPrintArea,
    printedImages
  )
  for (const printedImageVisualState of printedImagesVisualStates) {
  }
}
