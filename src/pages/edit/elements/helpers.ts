import { TElementType, TPosition, TRect, TSizeInfo } from '@/utils/types/global'

export const snapshotPersistElementPosition = (printAreaContainer: HTMLElement) => {
  for (const ele of printAreaContainer.querySelectorAll<HTMLElement>('.NAME-root-element')) {
    const persistData = ele.getAttribute('data-persist-position')
    if (persistData) {
      // Copy ngay lập tức
      ele.setAttribute('data-persist-position-snapshot', persistData)
    }
  }
}

const calculateElementPositionRelativeToPrintArea = (
  printAreaContainer: HTMLElement,
  element: HTMLElement,
  allowedPrintArea: HTMLElement,
  allowedPrintAreaX: number,
  allowedPrintAreaY: number,
  allowedPrintAreaWidth: number,
  allowedPrintAreaHeight: number
): TPosition => {
  const vungin_moi = allowedPrintArea.getBoundingClientRect()
  // Lấy bounding rect của B

  const rong_moi = vungin_moi.width
  const cao_moi = vungin_moi.height
  const x_moi = vungin_moi.left
  const y_moi = vungin_moi.top

  const phantu = element.getBoundingClientRect()
  const rong_cu = phantu.width
  const cao_cu = phantu.height
  const x_cu = phantu.left
  const y_cu = phantu.top

  const phan_tram_so_voi_rong_cu = ((x_cu - allowedPrintAreaX) * 100) / allowedPrintAreaWidth
  const phan_tram_so_voi_cao_cu = ((y_cu - allowedPrintAreaY) * 100) / allowedPrintAreaHeight
  const toa_do_x_moi = x_moi + (phan_tram_so_voi_rong_cu * rong_moi) / 100
  const toa_do_y_moi = y_moi + (phan_tram_so_voi_cao_cu * cao_moi) / 100
  const containerRect = printAreaContainer.getBoundingClientRect()
  const containerStyle = window.getComputedStyle(printAreaContainer)
  const padL = parseFloat(containerStyle.paddingLeft) || 0
  const padT = parseFloat(containerStyle.paddingTop) || 0
  const borderL = printAreaContainer.clientLeft || 0
  const borderT = printAreaContainer.clientTop || 0
  const matrix = new DOMMatrix(containerStyle.transform)
  const containerScale = matrix.a || 1
  const transX = matrix.e || 0
  const transY = matrix.f || 0

  const xInContainerViewport = toa_do_x_moi - containerRect.left
  const yInContainerViewport = toa_do_y_moi - containerRect.top

  const xContent = (xInContainerViewport - borderL - padL - transX) / containerScale
  const yContent = (yInContainerViewport - borderT - padT - transY) / containerScale

  return {
    x: xContent,
    y: yContent,
  }

  // Lấy scale factor của A
  // const styleA = window.getComputedStyle(element)
  // const matrix = new DOMMatrix(styleA.transform)
  // const scale = matrix.a // scale đồng đều nên chỉ cần matrix.a

  // Lấy kích thước của A sau khi scale
  // const rectA = element.getBoundingClientRect() // x, y lúc có thay đổi hay chưa.

  // snapshot : copy elA từ A sang B. {x,y,scale, xpe, yper} // bouding box cũ.

  // console.log('>>> [fx][2] rects:', { rectA, rectB })

  // // Tính kích thước gốc và scale offset
  // const originalWidth = element.offsetWidth
  // const originalHeight = element.offsetHeight
  // console.log('>>> [fx][2] original sizes:', { originalWidth, originalHeight })
  // const scaleOffsetX = (rectA.width - originalWidth) / 2
  // const scaleOffsetY = (rectA.height - originalHeight) / 2
  // console.log('>>> [fx][2] scale offsets:', { scaleOffsetX, scaleOffsetY })

  // // Lấy vị trí CSS của B
  // // const styleB = window.getComputedStyle(allowedPrintArea)
  // // const bCssLeft = parseFloat(styleB.left) || 0
  // // const bCssTop = parseFloat(styleB.top) || 0
  // const bCssLeft = allowedPrintArea.offsetLeft
  // const bCssTop = allowedPrintArea.offsetTop
  // console.log('>>> [fx][2] allowedPrintArea offsets:', { bCssLeft, bCssTop })

  // // Tính offset mong muốn theo pixel
  // const offsetX = (elementXPercent / 100) * rectB.width
  // const offsetY = (elementYPercent / 100) * rectB.height
  // console.log('>>> [fx][2] offsets:', { offsetX, offsetY, elementXPercent, elementYPercent })

  // // Vị trí thực tế mong muốn (vị trí hiển thị của góc top-left A)
  // const targetActualLeft = bCssLeft + offsetX
  // const targetActualTop = bCssTop + offsetY
  // console.log('>>> [fx][2] target actuals:', { targetActualLeft, targetActualTop })

  // // Compensate cho scale offset để tính CSS left/top
  // // Vì transform-origin: center, element "lùi lại" khi scale
  // const targetCssLeft = targetActualLeft + scaleOffsetX
  // const targetCssTop = targetActualTop + scaleOffsetY
  // console.log('>>> [fx][2] target css:', { targetCssLeft, targetCssTop })

  // // Set vị trí CSS
  // // element.style.left = `${targetCssLeft}px`
  // // element.style.top = `${targetCssTop}px`
  // // console.log('>>> [fx][2] targets final:', {
  // //   targetCssLeft,
  // //   targetCssTop,
  // // })
  // // handleSetElementPosition(targetCssLeft, targetCssTop)
  // return {
  //   x: targetCssLeft,
  //   y: targetCssTop,
  // }
}

const calculateElementScaleRelativeToPrintArea = (
  printArea: HTMLElement,
  prePrintAreaSize: TSizeInfo
) => {
  const rectPrintArea = printArea.getBoundingClientRect() // vùng in mới
  const rectPrintAreaWidth = rectPrintArea.width
  const rectPrintAreaHeight = rectPrintArea.height
  const prePrintAreaWidth = prePrintAreaSize.width // vùng in cũ
  const prePrintAreaHeight = prePrintAreaSize.height // vùng in cũ
  const prePrintAreaRatio = prePrintAreaWidth / prePrintAreaHeight
  if (prePrintAreaRatio > rectPrintAreaWidth / rectPrintAreaHeight) {
    const newPrePrintAreaHeight = rectPrintAreaWidth / prePrintAreaRatio
    const scaleFactor = newPrePrintAreaHeight / prePrintAreaHeight
    return scaleFactor
  }
  const newPrePrintAreaWidth = rectPrintAreaHeight * prePrintAreaRatio
  const scaleFactor = newPrePrintAreaWidth / prePrintAreaWidth
  return scaleFactor
}

type TPersistElementPositionPayload = {
  [elementId: string]: {
    posXPixel: number
    posYPixel: number
    scale: number
  }
}

export const stayElementsRelativeToPrintArea = (
  printAreaContainer: HTMLElement,
  allowedPrintArea: HTMLElement,
  callback: (persistElementPositionPayloads: TPersistElementPositionPayload) => void
) => {
  const elements = printAreaContainer.querySelectorAll<HTMLElement>('.NAME-root-element')
  // console.log('>>> [fx] elements:', elements)
  const persistElementPositionPayloads: TPersistElementPositionPayload = {}
  for (const ele of elements) {
    const elementId = ele.getAttribute('data-root-element-id')
    if (!elementId) continue
    const persistData = ele.getAttribute('data-persist-position-snapshot')
    // console.log('>>> [fx] ele:', { ele, persistData })
    if (!persistData) continue
    const parsedPersistData = JSON.parse(persistData) as TPersistElementPositionReturn
    console.log('>>> [fx] parsed Persist snapshot:', { ele, parsedPersistData })
    const {
      elementXPercent,
      elementYPercent,
      elementScale,
      allowedPrintAreaHeight,
      allowedPrintAreaWidth,
      allowedPrintAreaX,
      allowedPrintAreaY,
    } = parsedPersistData
    const newPos = calculateElementPositionRelativeToPrintArea(
      printAreaContainer,
      ele,
      allowedPrintArea,
      allowedPrintAreaX,
      allowedPrintAreaY,
      allowedPrintAreaWidth,
      allowedPrintAreaHeight
    )
    persistElementPositionPayloads[elementId] = {
      posXPixel: newPos.x,
      posYPixel: newPos.y,
      // scale: calculateElementScaleRelativeToPrintArea(allowedPrintArea, {
      //   width: allowedPrintAreaWidth,
      //   height: allowedPrintAreaHeight,
      // }),
      scale: 1,
    }
  }
  callback(persistElementPositionPayloads)
}

type TPersistElementPositionReturn = {
  elementXPercent: number
  elementYPercent: number
  elementScale: number
  allowedPrintAreaHeight: number
  allowedPrintAreaWidth: number
  allowedPrintAreaX: number
  allowedPrintAreaY: number
}

export const persistElementPositionToPrintArea = (
  rootElement: HTMLElement | null,
  allowedPrintArea: HTMLElement | null,
  elementScale: number
): TPersistElementPositionReturn => {
  if (!rootElement || !allowedPrintArea) {
    return {
      elementXPercent: 0,
      elementYPercent: 0,
      elementScale: 1,
      allowedPrintAreaHeight: 0,
      allowedPrintAreaWidth: 0,
      allowedPrintAreaX: 0,
      allowedPrintAreaY: 0,
    }
  }

  const rectA = rootElement.getBoundingClientRect()
  const rectB = allowedPrintArea.getBoundingClientRect()

  // Lấy scale factor (vì scale đồng đều nên chỉ cần lấy 1 giá trị)
  // const styleA = window.getComputedStyle(rootElement)
  // const matrix = new DOMMatrix(styleA.transform)
  // const scale = matrix.a // hoặc matrix.d, vì scale đồng đều

  // Lấy vị trí CSS gốc
  // const cssLeft = parseFloat(styleA.left) || 0
  // const cssTop = parseFloat(styleA.top) || 0
  const cssLeft = rootElement.offsetLeft
  const cssTop = rootElement.offsetTop
  // console.log('>>> [fx] css:', {
  //   cssLeft,
  //   cssTop,
  // })

  // Kích thước gốc (trước scale)
  const originalWidth = rootElement.offsetWidth
  const originalHeight = rootElement.offsetHeight
  // console.log('>>> [fx] orig:', { originalWidth, originalHeight, rectA })

  // Scale offset (do transform-origin: center)
  const scaleOffsetWidth = (rectA.width - originalWidth) / 2
  const scaleOffsetHeight = (rectA.height - originalHeight) / 2
  // console.log('>>> [fx] scaleOffset:', { scaleOffsetWidth, scaleOffsetHeight })

  // Vị trí thực tế hiển thị của góc top-left
  const actualLeft = cssLeft - scaleOffsetWidth
  const actualTop = cssTop - scaleOffsetHeight
  // console.log('>>> [fx] act:', {
  //   actualLeft,
  //   actualTop,
  // })

  // Vị trí của B
  // const styleB = window.getComputedStyle(allowedPrintArea)
  // const bCssLeft = parseFloat(styleB.left) || 0
  // const bCssTop = parseFloat(styleB.top) || 0
  const bCssLeft = allowedPrintArea.offsetLeft
  const bCssTop = allowedPrintArea.offsetTop
  // console.log('>>> [fx] par:', {
  //   bCssLeft,
  //   bCssTop,
  //   allowedPrintArea,
  // })

  // Delta
  const deltaX = actualLeft - bCssLeft
  const deltaY = actualTop - bCssTop
  // console.log('>>> [fx] dels:', {
  //   deltaX,
  //   deltaY,
  // })

  return {
    elementXPercent: (deltaX / rectB.width) * 100,
    elementYPercent: (deltaY / rectB.height) * 100,
    elementScale,
    allowedPrintAreaHeight: rectB.height,
    allowedPrintAreaWidth: rectB.width,
    allowedPrintAreaX: rectB.left,
    allowedPrintAreaY: rectB.top,
  }
}

export const DEFAULT_ELEMENT_DIMENSION_SIZE = () => {
  if (window.innerWidth < 1500) {
    return 80
  }
  return 120
}

export const calculateInitialImageElementPosition = (
  imageNaturalSize: TSizeInfo,
  scaleFactor: number,
  elementType: TElementType
): TRect => {
  const printAreaContainer = document.body.querySelector<HTMLElement>('.NAME-print-area-container')
  if (!printAreaContainer) return { x: 0, y: 0, width: 0, height: 0 }
  const allowedPrintArea = printAreaContainer.querySelector<HTMLElement>('.NAME-print-area-allowed')
  if (!allowedPrintArea) return { x: 0, y: 0, width: 0, height: 0 }
  const allowedPrintAreaRect = allowedPrintArea.getBoundingClientRect()
  const printAreaContainerRect = printAreaContainer.getBoundingClientRect()
  const imgRatio = imageNaturalSize.width / imageNaturalSize.height
  let imgHeight: number
  let imgWidth: number
  const margin = elementType === 'sticker' ? 8 : 4
  if (imgRatio > allowedPrintAreaRect.width / allowedPrintAreaRect.height) {
    imgWidth = allowedPrintAreaRect.width - margin
    imgHeight = imgWidth / imgRatio - margin
  } else {
    imgHeight = allowedPrintAreaRect.height - margin
    imgWidth = imgHeight * imgRatio - margin
  }
  return {
    height: imgHeight,
    width: imgWidth,
    x:
      (allowedPrintAreaRect.left +
        (allowedPrintAreaRect.width - imgWidth) / 2 -
        printAreaContainerRect.left) /
      scaleFactor,
    y:
      (allowedPrintAreaRect.top +
        (allowedPrintAreaRect.height - imgHeight) / 2 -
        printAreaContainerRect.top) /
      scaleFactor,
  }
}

export function measureTextBlock(
  textContent: string,
  fontSize?: string,
  lineHeight?: number,
  fontFamily?: string,
  fontWeight?: string
): TSizeInfo {
  const div = document.createElement('div')
  if (!fontSize || !lineHeight || !fontFamily || !fontWeight) return { width: 0, height: 0 }

  div.style.position = 'absolute'
  div.style.visibility = 'hidden'
  div.style.whiteSpace = 'nowrap' // không wrap → đo width thực
  div.style.fontSize = fontSize
  div.style.lineHeight = `${lineHeight}`
  div.style.fontFamily = fontFamily
  div.style.fontWeight = fontWeight

  div.textContent = textContent
  document.body.appendChild(div)

  const box: TSizeInfo = {
    width: div.offsetWidth,
    height: div.offsetHeight,
  }

  div.remove()
  return box
}

export const calculateInitialTextElementPosition = (
  scaleFactor: number,
  textContent: string,
  fontSize?: string,
  lineHeight?: number,
  fontFamily?: string,
  fontWeight?: string
): TPosition => {
  const textBox = measureTextBlock(textContent, fontSize, lineHeight, fontFamily, fontWeight)
  const allowedPrintArea = document.querySelector<HTMLElement>('.NAME-print-area-allowed')
  if (!allowedPrintArea) return { x: 0, y: 0 }
  const printAreaContainer = document.querySelector<HTMLElement>('.NAME-print-area-container')
  if (!printAreaContainer) return { x: 0, y: 0 }
  const allowedPrintAreaRect = allowedPrintArea.getBoundingClientRect()
  const printAreaContainerRect = printAreaContainer.getBoundingClientRect()
  return {
    x:
      (allowedPrintAreaRect.left +
        (allowedPrintAreaRect.width - textBox.width) / 2 -
        printAreaContainerRect.left) /
      scaleFactor,
    y:
      (allowedPrintAreaRect.top +
        (allowedPrintAreaRect.height - textBox.height) / 2 -
        printAreaContainerRect.top) /
      scaleFactor,
  }
}
