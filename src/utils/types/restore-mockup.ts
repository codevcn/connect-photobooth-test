import {
  TClippedElements,
  TPrintedImageVisualState,
  TStickerVisualState,
  TTextVisualState,
} from './global'
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

type TAllowedPrintArea = {
  width: number // in pixels
  height: number // in pixels
  offsetX: number // in pixels
  offsetY: number // in pixels
}

// ============================================
// PRODUCT INFO (Optional - for reference)
// ============================================

type TProductInfo = {
  id: number | string
  name?: string
  variantId?: number | string
  surfaceId?: number | string
  mockup: {
    id: number | string
    imageURL: string
  }
}

type TPrintAreaContainerWrapper = {
  width: number // in pixels
  height: number // in pixels
}

// ============================================
// MAIN SCHEMA
// ============================================

export type TRestoreMockupBodySchema = {
  printAreaContainerWrapper: TPrintAreaContainerWrapper

  /**
   * Thông tin sản phẩm (optional - để reference/logging)
   */
  product?: TProductInfo

  /**
   * Cấu hình print area - REQUIRED
   * Xác định kích thước canvas và vùng in
   */
  allowedPrintArea: TAllowedPrintArea

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
  printedImageElements?: TPrintedImageVisualState[]
  stickerElements?: TStickerVisualState[]
  textElements?: TTextVisualState[]

  /**
   * Metadata (optional - for tracking/debugging)
   */
  metadata?: {
    sessionId?: string
  }
}
