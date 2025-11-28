import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'
import { getInitialContants } from './contants'
import { TImgMimeType, TPrintAreaShapeType, TSurfaceType, TTextFont } from './types/global'

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

export const detectShapeType = (width: number, height: number): TPrintAreaShapeType => {
  if (width === height) return 'square'
  if (width > height) return 'landscape'
  return 'portrait'
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

export const generateIdForFont = (fontFamily: string, fontWeight: string): string => {
  return `injected-font-${fontFamily.replace(/\s+/g, '-').toLowerCase()}-${fontWeight}`
}

export const injectFontToDocumentHead = (
  idForInject: string,
  fontFamily: TTextFont['fontFamily'],
  fontWeight: TTextFont['fontWeight'] = '400',
  fontUrl: TTextFont['loadFontURL'],
  fontFormat: TTextFont['fontFormat'],
  fontStyle: TTextFont['fontStyle'] = 'normal',
  fontDisplay: TTextFont['fontDisplay'] = 'swap'
) => {
  if (document.getElementById(idForInject)) return // Đã inject rồi thì không inject nữa
  const style = document.createElement('style')
  style.id = idForInject
  style.textContent = `
    @font-face {
      font-family: "${fontFamily}";
      font-weight: ${fontWeight};
      font-style: ${fontStyle};
      src: url("${fontUrl}") format("${fontFormat}");
      font-display: ${fontDisplay};
    }
  `
  document.head.appendChild(style)
}

/**
 * Chuyển đổi màu RGB sang Hexa
 * @param r - Red (0-255)
 * @param g - Green (0-255)
 * @param b - Blue (0-255)
 * @returns Mã màu hexa (ví dụ: "#FF5733")
 */
export function rgbToHex(r: number, g: number, b: number): string {
  // Đảm bảo giá trị trong khoảng 0-255
  r = Math.max(0, Math.min(255, Math.round(r)))
  g = Math.max(0, Math.min(255, Math.round(g)))
  b = Math.max(0, Math.min(255, Math.round(b)))

  const toHex = (n: number): string => {
    const hex = n.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

/**
 * Chuyển đổi màu RGB sang Hexa
 * @param rgb - Chuỗi RGB (ví dụ: "rgb(255, 87, 51)" hoặc "rgba(255, 87, 51, 0.5)")
 * @returns Mã màu hexa (ví dụ: "#FF5733") hoặc null nếu không hợp lệ
 */
export function rgbStringToHex(rgb: string): string | null {
  // Loại bỏ khoảng trắng thừa
  rgb = rgb.trim()

  // Parse chuỗi rgb/rgba
  const rgbPattern = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*[\d.]+\s*)?\)$/
  const match = rgb.match(rgbPattern)

  if (!match) {
    return null
  }

  let r = parseInt(match[1])
  let g = parseInt(match[2])
  let b = parseInt(match[3])

  // Kiểm tra và đảm bảo giá trị trong khoảng 0-255
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
    return null
  }

  const toHex = (n: number): string => {
    const hex = n.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

/**
 * Chuyển đổi màu Hexa sang RGB
 * @param hex - Mã màu hexa (ví dụ: "#FF5733" hoặc "FF5733")
 * @returns Object chứa r, g, b hoặc null nếu không hợp lệ
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Loại bỏ dấu # nếu có
  hex = hex.replace(/^#/, '')

  // Kiểm tra định dạng hợp lệ
  if (!/^[0-9A-Fa-f]{6}$/.test(hex) && !/^[0-9A-Fa-f]{3}$/.test(hex)) {
    return null
  }

  // Xử lý format 3 ký tự (ví dụ: "F53" -> "FF5533")
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('')
  }

  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  return { r, g, b }
}

/**
 * Kiểm tra xem string có phải là mã màu hexa hay rgb
 * @param color - Chuỗi màu cần kiểm tra
 * @returns 'hex' | 'rgb' | 'unknown'
 */
export function detectColorFormat(color: string): 'hex' | 'rgb' | 'unknown' {
  // Loại bỏ khoảng trắng thừa
  color = color.trim()

  // Kiểm tra hexa
  const hexPattern = /^#?[0-9A-Fa-f]{3}$|^#?[0-9A-Fa-f]{6}$/
  if (hexPattern.test(color)) {
    return 'hex'
  }

  // Kiểm tra rgb/rgba
  const rgbPattern = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*[\d.]+\s*)?\)$/
  const match = color.match(rgbPattern)

  if (match) {
    const [, r, g, b] = match
    const rNum = parseInt(r)
    const gNum = parseInt(g)
    const bNum = parseInt(b)

    // Kiểm tra giá trị trong khoảng 0-255
    if (rNum >= 0 && rNum <= 255 && gNum >= 0 && gNum <= 255 && bNum >= 0 && bNum <= 255) {
      return 'rgb'
    }
  }

  return 'unknown'
}
export function calContrastForReadableColor(hex: string): string {
  const c = hex.trim().replace('#', '')

  // Chuyển #RGB → #RRGGBB
  const normalized =
    c.length === 3
      ? c
          .split('')
          .map((x) => x + x)
          .join('')
      : c

  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)

  // Tính độ sáng theo chuẩn WCAG
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b

  // Nếu màu sáng → trả về đen, nếu màu tối → trả về trắng
  return luminance > 160 ? '#000000' : '#FFFFFF'
}

export const sortSizes = (sizes: string[]): string[] => {
  // Thứ tự nền tảng
  const baseOrder: Record<string, number> = {
    s: 1,
    m: 2,
    l: 3,
    xl: 4,
  }

  const getRank = (size: string): number => {
    const s = size.toLowerCase().trim()

    // Size dạng Nxl (2xl, 3xl...)
    const match = /^(\d+)xl$/.exec(s)
    if (match) {
      const n = parseInt(match[1], 10)
      return 4 + n // xl=4 → 2xl=5 → 3xl=6...
    }

    // Size thường
    if (baseOrder[s] !== undefined) {
      return baseOrder[s]
    }

    // Nếu gặp size lạ → đẩy ra sau cùng nhưng vẫn cố giữ thứ tự ổn định
    return 999
  }

  return [...sizes].sort((a, b) => getRank(a) - getRank(b))
}
export function adjustNearF3F4F6(hex: string): string {
  const normalizeHex = (h: string) => {
    const c = h.replace('#', '').trim()
    return c.length === 3
      ? c
          .split('')
          .map((x) => x + x)
          .join('')
      : c
  }

  const toRGB = (h: string) => ({
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  })

  const distance = (
    c1: { r: number; g: number; b: number },
    c2: { r: number; g: number; b: number }
  ) => Math.sqrt(Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2))

  const input = toRGB(normalizeHex(hex))

  const base = toRGB('f3f4f6') // màu #f3f4f6

  const d = distance(input, base)

  // Ngưỡng đánh giá "gần" màu f3f4f6
  if (d < 25) {
    return '#FFFFFF' // gần → trả về trắng
  }

  return '#f3f4f6' // còn lại → trả về f3f4f6
}

export function contrastFromWhite(hex: string): string {
  const normalizeHex = (h: string) => {
    const c = h.replace('#', '').trim()
    return c.length === 3
      ? c
          .split('')
          .map((x) => x + x)
          .join('')
      : c
  }

  const toRGB = (h: string) => ({
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  })

  const distance = (
    c1: { r: number; g: number; b: number },
    c2: { r: number; g: number; b: number }
  ) => Math.sqrt(Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2))

  const input = toRGB(normalizeHex(hex))
  const white = { r: 255, g: 255, b: 255 }

  const d = distance(input, white)

  // Ngưỡng "gần trắng": 40 là mức hợp lý
  if (d < 40) {
    return '#000000' // gần trắng → trả về đen
  }

  return '#FFFFFF' // còn lại → trả về trắng
}

export function getContrastColor(bgColor: string): string {
  // Chuẩn hoá
  const hex = bgColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Tính độ sáng theo công thức perceptual
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b

  // Nếu nền sáng → dùng chữ đen, nền tối → chữ trắng
  return luminance > 180 ? '#000' : '#fff'
}

export const getFinalColorValue = () => {
  const attr = useProductUIDataStore.getState().pickedVariant?.attributes
  return attr?.color || attr?.hex
}
