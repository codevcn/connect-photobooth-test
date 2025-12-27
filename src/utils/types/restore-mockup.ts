import { TPrintedImageVisualState, TStickerVisualState, TTextVisualState } from './global'
import { TPrintLayout } from './print-layout'

export type TMockupRequest = {
  imageUrl: string
  mockupType?: string
}

export type TMockupResponse = {
  success: boolean
  restoredImageUrl?: string
  error?: string
}

export type TMockupConfig = {
  width: number
  height: number
  quality: number
}

// ============================================
// PRINT AREA
// ============================================

type TPrintAreaConfig = {
  // Kích thước thực tế (pixels) - dùng để tạo canvas
  widthRealPx: number
  heightRealPx: number

  // Vị trí & kích thước tương đối trên product image (optional)
  printX?: number
  printY?: number
  printW?: number
  printH?: number

  // Scale factor của print area
  scale?: number

  // Background image (product mockup) - optional
  backgroundImageUrl?: string
}

// ============================================
// PRODUCT INFO (Optional - for reference)
// ============================================

type TProductInfo = {
  id: number | string
  name?: string
  variantId?: number | string
  surfaceId?: number | string
}

// ============================================
// MAIN SCHEMA
// ============================================

export type TRestoreMockupBodySchema = {
  /**
   * Thông tin sản phẩm (optional - để reference/logging)
   */
  product?: TProductInfo

  /**
   * Cấu hình print area - REQUIRED
   * Xác định kích thước canvas và vùng in
   */
  printArea: TPrintAreaConfig

  /**
   * Layout mode và config
   */
  layoutMode: 'with-layout' | 'no-layout' | 'frame-layout'

  /**
   * Layout config (required nếu layoutMode !== 'no-layout')
   */
  layout?: TPrintLayout | null

  /**
   * Danh sách elements - REQUIRED
   * Bao gồm printed-image, sticker, text
   * Nên được sort theo zindex trước khi gửi
   */
  printedImageElements: TPrintedImageVisualState[]
  stickerElements: TStickerVisualState[]
  textElements: TTextVisualState[]

  /**
   * Các elements đã bị clip (polygon data)
   * Key = element id, value = polygon string
   */
  clippedElements?: {
    [elementId: string]: {
      polygon: string | null
    }
  }

  /**
   * Metadata (optional - for tracking/debugging)
   */
  metadata?: {
    clientTimestamp?: number
    sessionId?: string
    userId?: string
    [key: string]: unknown
  }
}
