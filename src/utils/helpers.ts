import { getInitialContants } from './contants'
import {
  TImgMimeType,
  TPrintAreaShapeType,
  TSizeInfo,
  TSurfaceType,
  TTemplateType,
} from './types/global'

export const getNaturalSizeOfImage = (
  imgURL: string,
  onLoaded: (naturalWidth: number, naturalHeight: number) => void,
  onError: (error: ErrorEvent) => void
) => {
  const img = new Image()
  img.onload = function () {
    onLoaded(img.naturalWidth, img.naturalHeight)
  }
  img.onerror = (event) => {
    if (event instanceof ErrorEvent) {
      onError(event)
    } else if (typeof event === 'string') {
      onError(new ErrorEvent('error', { message: event }))
    } else {
      onError(new ErrorEvent('error', { message: 'Unknown error occurred while loading image' }))
    }
  }
  img.src = imgURL
}

export function swapArrayItems<T>(arr: T[], indexA: number, indexB: number): void {
  if (
    indexA < 0 ||
    indexB < 0 ||
    indexA >= arr.length ||
    indexB >= arr.length ||
    indexA === indexB
  ) {
    return
  }
  const temp = arr[indexA]
  arr[indexA] = arr[indexB]
  arr[indexB] = temp
}

export function formatNumberWithCommas(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function capitalizeFirstLetter(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function formatTime(countdownDuration: number): string {
  const minutes = Math.floor(countdownDuration / 60)
  const seconds = countdownDuration % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Kiểm tra xem chuỗi có phải là số điện thoại Việt Nam hợp lệ không.
 * Hỗ trợ các dạng:
 * - 0912345678
 * - 84912345678
 * - +84912345678
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false

  const regex = /^(?:\+84|84|0)(3|5|7|8|9)\d{8}$/
  return regex.test(phone.trim())
}

/**
 * Kiểm tra xem chuỗi có phải là địa chỉ email hợp lệ không.
 * Hỗ trợ các định dạng phổ biến: user@example.com
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email.trim())
}

export const ativateFullScreen = () => {
  const docElm = document.documentElement
  if (docElm.requestFullscreen) {
    docElm.requestFullscreen()
  } else if ((docElm as any).mozRequestFullScreen) {
    ;(docElm as any).mozRequestFullScreen()
  } else if ((docElm as any).webkitRequestFullScreen) {
    ;(docElm as any).webkitRequestFullScreen()
  } else if ((docElm as any).msRequestFullscreen) {
    ;(docElm as any).msRequestFullscreen()
  }
}

export const exitFullScreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if ((document as any).webkitExitFullscreen) {
    ;(document as any).webkitExitFullscreen()
  } else if ((document as any).msExitFullscreen) {
    ;(document as any).msExitFullscreen()
  } else if ((document as any).mozCancelFullScreen) {
    ;(document as any).mozCancelFullScreen()
  }
}

export const roundZooming = (zoomValue: number): number => {
  return parseFloat(zoomValue.toFixed(getInitialContants<number>('ELEMENT_ROUND_ZOOMING_FIXED')))
}

export const typeToObject = <Type>(objectInput: Type): Type => objectInput

export const generateUniqueId = (): string => crypto.randomUUID()

/**
 * Chuyển canvas thành Blob
 */
export const canvasToBlob = (
  canvas: HTMLCanvasElement,
  callback: (blob: Blob | null) => void,
  type: string = 'image/png'
): void => {
  canvas.toBlob((blob) => {
    if (blob) {
      callback(blob)
    } else {
      callback(null)
    }
  }, type)
}

export const labelToSurfaceType = (surfaceType: TSurfaceType): string => {
  switch (surfaceType) {
    case 'front':
      return 'Mặt trước'
    case 'back':
      return 'Mặt sau'
    case 'both':
      return 'Cả hai mặt'
  }
}

export const convertMimeTypeToExtension = (mimeType: TImgMimeType): string => {
  switch (mimeType) {
    case 'image/png':
      return 'png'
    case 'image/jpeg':
      return 'jpeg'
    case 'image/webp':
      return 'webp'
    default:
      return ''
  }
}

export const resizeImage = (
  file: File,
  targetWidth: number,
  targetHeight: number,
  quality: number = 0.95
): Promise<Blob | null> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject(new Error('Failed to get canvas context'))
      return
    }
    img.onload = () => {
      // Set canvas size
      canvas.width = targetWidth
      canvas.height = targetHeight

      // Draw image lên canvas với kích thước mới
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

      // Convert canvas sang blob
      canvas.toBlob(
        (blob) => {
          resolve(blob)
        },
        'image/jpeg',
        quality
      ) // 0.95 là quality (95%)
    }

    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export const resizeCanvas = (
  sourceCanvas: HTMLCanvasElement,
  newWidth: number,
  newHeight: number
): HTMLCanvasElement | undefined => {
  // Tạo canvas mới với kích thước mong muốn
  const resizedCanvas = document.createElement('canvas')
  resizedCanvas.width = newWidth
  resizedCanvas.height = newHeight

  const ctx = resizedCanvas.getContext('2d')
  if (!ctx) {
    return undefined
  }

  // Vẽ canvas cũ lên canvas mới với kích thước mới
  ctx.drawImage(sourceCanvas, 0, 0, newWidth, newHeight)

  return resizedCanvas
}

export const isHomePage = (): boolean => {
  return window.location.pathname === '/'
}

export const diffPrintedImageFromRectType = (
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
  const imgRatio = printedImageSize.width / printedImageSize.height
  const { width, height } = frameSize
  if (width < height) {
    return imgRatio < 1
  } else if (width > height) {
    return imgRatio > 1
  }
  return imgRatio === 1
}

export const detectShapeType = (width: number, height: number): TPrintAreaShapeType => {
  if (width === height) return 'square'
  if (width > height) return 'landscape'
  return 'portrait'
}

/**
 * Chuyển đổi template type sang grid CSS styles
 * @param templateType - Loại template
 * @returns Object chứa các CSS properties cho grid layout
 */
export const styleToFramesDisplayerByTemplateType = (
  templateType: TTemplateType
): React.CSSProperties => {
  switch (templateType) {
    // 1 frame templates
    case '1-square':
      return {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: '1fr',
        height: '100%',
        width: '100%',
      }

    // 2 frames templates
    case '2-horizon':
      return {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: 'repeat(2, 1fr)',
        height: '100%',
        width: '100%',
      }
    case '2-vertical':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: '1fr',
        width: '100%',
        height: '100%',
      }

    // 3 frames templates
    case '3-left':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        height: '100%',
        width: '100%',
      }
    case '3-right':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        height: '100%',
        width: '100%',
      }
    case '3-top':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        height: '100%',
        width: '100%',
      }
    case '3-bottom':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        height: '100%',
        width: '100%',
      }

    // 4 frames templates
    case '4-square':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        height: '100%',
        width: '100%',
      }
    case '4-horizon':
      return {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: 'repeat(4, 1fr)',
        height: '100%',
        width: '100%',
      }
    case '4-vertical':
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: '1fr',
        height: '100%',
        width: '100%',
      }

    default:
      return {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridTemplateRows: '1fr',
        height: '100%',
        width: '100%',
      }
  }
}

export const styleFrameByTemplateType = (
  templateType: TTemplateType,
  frameIndex: number
): React.CSSProperties => {
  switch (templateType) {
    case '2-horizon':
      return { minHeight: '15px' }
    case '2-vertical':
      return { minWidth: '15px' }
    case '3-left':
      if (frameIndex === 2) return { gridRow: 'span 2 / span 2' }
      return {}
    case '3-top':
      if (frameIndex === 3) return { gridColumn: 'span 2 / span 2' }
      return {}
    case '3-right':
      if (frameIndex === 1) return { gridRow: 'span 2 / span 2' }
      return {}
    case '3-bottom':
      if (frameIndex === 1) return { gridColumn: 'span 2 / span 2' }
      return {}
    default:
      return {}
  }
}

export const stylePlacedImageByTemplateType = (
  templateType: TTemplateType,
  frameIndex: number,
  defaultStyle: React.CSSProperties = {}
): React.CSSProperties => {
  if (templateType === '2-horizon') {
    if (frameIndex === 1) {
      return {
        objectPosition: 'bottom',
      }
    } else {
      return {
        objectPosition: 'top',
      }
    }
  } else if (templateType === '2-vertical') {
    if (frameIndex === 1) {
      return { objectPosition: 'right' }
    } else {
      return { objectPosition: 'left' }
    }
  } else if (templateType === '3-left') {
    if (frameIndex === 1) {
      return { objectPosition: 'right bottom' }
    } else if (frameIndex === 2) {
      return { objectPosition: 'left center' }
    } else {
      return { objectPosition: 'right top' }
    }
  } else if (templateType === '3-right') {
    if (frameIndex === 1) {
      return { objectPosition: 'right center' }
    } else if (frameIndex === 2) {
      return { objectPosition: 'left bottom' }
    } else {
      return { objectPosition: 'left top' }
    }
  } else if (templateType === '3-top') {
    if (frameIndex === 1) {
      return { objectPosition: 'right bottom' }
    } else if (frameIndex === 2) {
      return { objectPosition: 'left bottom' }
    } else {
      return { objectPosition: 'top center' }
    }
  } else if (templateType === '3-bottom') {
    if (frameIndex === 1) {
      return { objectPosition: 'bottom center' }
    } else if (frameIndex === 2) {
      return { objectPosition: 'right top' }
    } else {
      return { objectPosition: 'left top' }
    }
  } else if (templateType === '4-horizon') {
    return { objectPosition: 'center' }
  } else if (templateType === '4-vertical') {
    return { objectPosition: 'center' }
  } else if (templateType === '4-square') {
    if (frameIndex === 1) {
      return { objectPosition: 'right bottom' }
    } else if (frameIndex === 2) {
      return { objectPosition: 'left bottom' }
    } else if (frameIndex === 3) {
      return { objectPosition: 'right top' }
    } else {
      return { objectPosition: 'left top' }
    }
  }
  return defaultStyle
}

export function friendlyCurrency(code: string): string {
  const map: Record<string, string> = {
    VND: 'đ',
    USD: 'dollars',
    EUR: 'euros',
    JPY: 'yen',
    GBP: 'pounds',
    KRW: 'won',
    CNY: 'yuan',
  }

  const upper = code.toUpperCase()
  return map[upper] ?? code // fallback: nếu không có thì trả về nguyên code
}
