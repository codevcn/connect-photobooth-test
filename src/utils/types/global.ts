export type TIntersectSameFields<A, B> = {
  [K in keyof A & keyof B as A[K] extends B[K] ? (B[K] extends A[K] ? K : never) : never]: A[K]
}

export type TProductSize = 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL'

export type TProductColor = {
  title: string
  value: string
}

export type TPrintAreaInfo = {
  // productImageId: string
  id: number
  area: {
    printX: number // pixel position x
    printY: number // pixel position y
    printW: number // pixel width
    printH: number // pixel height
    widthRealPx: number // real width of product image (for exporting)
    heightRealPx: number // real height of product image (for exporting)
  }
  surfaceType: TSurfaceType
  imageUrl: string
}

export type TProductVariantSurface = {
  variantId: number
  surfaceId: number
  imageURL: string
}

export type TBaseProduct = {
  id: number
  url: string
  name: string
  description: string
  variants: TClientProductVariant[]
  detailImages: string[]
  inNewLine: boolean
  printAreaList: TPrintAreaInfo[] // surfaces
  variantSurfaces: TProductVariantSurface[]
}

export type TProductCategory =
  | 'shirt'
  | 'hat'
  | 'cup'
  | 'keychain'
  | 'phonecase'
  | 'figurine'
  | 'totebag'

export type TClientProductVariant = {
  id: number
  name: string
  size: TProductSize
  color: TProductColor
  priceAmountOneSide: number
  priceAmountBothSide: number
  currency: string
  priceAfterDiscount?: number
  stock: number
  category?: TProductCategory
}

export type TPrintedImage = {
  id: string
  url: string
  width: number
  height: number
  isOriginalImage?: boolean
}

export type TElementType = 'text' | 'sticker' | 'printed-image' | 'template-frame'

export type TElementLayerState = {
  elementId: string
  index: number
}

export type TPreSentMockupImageLink = {
  mockupId: string
  imageUrl: string
}

export type TGlobalContextValue = {
  pickedElementRoot: HTMLElement | null
  elementType: TElementType | null
  sessionId: string | null
  preSentMockupImageLinks: TPreSentMockupImageLink[]
  addPreSentMockupImageLink: (imageUrl: string, mockupId: string) => void
}

export type TElementLayerContextValue = {
  elementLayers: TElementLayerState[]
  setElementLayers: (elementLayers: TElementLayerState[]) => void
  addToElementLayers: (elementLayer: TElementLayerState) => void
  removeFromElementLayers: (elementId: string[]) => void
  updateElementLayerIndex: (elementId: string, newIndex: number) => void
}

export type TDetectCollisionWithViewportEdgesResult = {
  collidedEdge: 'left' | 'right' | 'top' | 'bottom' | null
}

export type TProductCartInfo = {
  productId: number
  productImageId: number
  color: {
    title: string
    value: string
  }
  size: TProductSize
}

export type TSavedMockupData = {
  sessionId: string
  productsInCart: TProductInCart[]
}

export type TPaymentType = 'momo' | 'zalo' | 'cod'

export type TBrands = 'photoism'

export type TUserInputImage = {
  url: string
  blob: Blob
  isOriginalImage?: boolean
}

export type TEditedImage = TPrintedImage

export type TEditedImageContextValue = {
  printedImages: TEditedImage[]
  setPrintedImages: (printedImages: TEditedImage[]) => void
  clearAllPrintedImages: () => void
}

export type TProductContextValue = {
  products: TBaseProduct[]
  setProducts: (products: TBaseProduct[]) => void
}

export type TVoucher = {
  code: string
  description: string
  discountType: 'percentage' | 'fixed'
  discountValue: number // percentage: 0-100, fixed: số tiền
  minOrderValue?: number // Giá trị đơn hàng tối thiểu
  maxDiscount?: number // Giảm tối đa (cho percentage)
}

export type VoucherValidationResult = {
  success: boolean
  message: string
  voucher?: TVoucher
}

export type TElementVisualBaseState = {
  position: {
    x: number
    y: number
  }
  scale: number
  angle: number
  zindex: number
}

export type TTextVisualState = Omit<TElementVisualBaseState, 'scale'> & {
  id: string
  fontSize: number
  textColor: string
  content: string
  fontFamily: string
  fontWeight: number
}

export type TStickerVisualState = TElementVisualBaseState & {
  id: string
  path: string
}

export type TPrintedImageVisualState = TElementVisualBaseState & {
  id: string
  url: string
}

export type TElementsVisualState = Partial<{
  stickers: TStickerVisualState[]
  printedImages: TPrintedImageVisualState[]
  texts: TTextVisualState[]
}>

export type TMockupDataId = string

export type TMockupData = {
  id: string
  elementsVisualState: TElementsVisualState
  imageData: TMockupImageData
  surfaceInfo: {
    id: number
    type: TSurfaceType
  }
  preSentImageLink?: string
}

export type TProductInCart = TProductCartInfo & {
  mockupDataList: TMockupData[]
}

export type TSurfaceType = 'front' | 'back' | 'both'

export type TPaymentProductItem = {
  productId: number
  productImageId: number
  name: string
  size: string
  color: {
    title: string
    value: string
  }
  quantity: number
  originalPrice: number
  discountedPrice?: number
  mockupData: {
    id: string
    image: string
    heightPx: number
    widthPx: number
  }
  elementsVisualState: TElementsVisualState
  surface: {
    id: number
    type: TSurfaceType
  }
  preSentImageLink?: string
}

export type TShippingInfo = {
  name: string
  phone: string
  email: string
  province: string
  city: string
  address: string
  message?: string
}

export type TMockupImageData = {
  dataUrl: string
  size: {
    width: number
    height: number
  }
}

export type TImageSizeInfo = TSizeInfo

export type TImgMimeType = 'image/png' | 'image/jpeg' | 'image/webp'

export type TEndOfPaymentData = {
  countdownInSeconds: number
  QRCode: string
  paymentMethod: {
    method: TPaymentType
    title: string
  }
  orderHashCode?: string
  paymentDetails: {
    subtotal: number
    shipping: number
    discount: number
    total: number
    voucherCode?: string
  }
}

export type TFramesCount = 1 | 2 | 3 | 4

export type TTemplateType =
  | '1-square'
  | '2-horizon'
  | '2-vertical'
  | '3-left'
  | '3-right'
  | '3-top'
  | '3-bottom'
  | '4-square'
  | '4-horizon'
  | '4-vertical'

export type TPrintTemplate = {
  id: string
  name: string
  frames: TTemplateFrame[]
  type: TTemplateType
  framesCount: TFramesCount
}

export type TBaseRectType = 'horizontal' | 'vertical' | 'square'

export type TframePerfectRectType = TBaseRectType

export type TTemplateFrame = {
  id: string
  index: number
  placedImage?: TPlacedImage
  framePerfectRectType: TframePerfectRectType
  height: number
  width: number
}

export type TPlacedImage = {
  id: string
  placementState: TPlacementState
  imgURL: string
}

export type TPlacementState = {
  frameIndex: number
  zoom: number
  objectFit: 'contain' | 'cover'
  squareRotation: number
  direction: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

export type TFontName = string

export type TFonts = {
  [fontName: TFontName]: {
    loadFontURL: string
  }
}

export type TLoadFontStatus = 'idle' | 'loading' | 'loaded' | 'error'

export type TFrameToAddPrintedImage = {
  frameId: string
  rectType: TframePerfectRectType
}

export type TLoadedTextFontContextValue = {
  availableFonts: string[]
  setAvailableFonts: (fonts: string[]) => void
}

export type TSizeInfo = {
  height: number
  width: number
}

export type TPrintAreaShapeType = 'square' | 'portrait' | 'landscape'

export type TPlacementDirection = {
  left: number
  top: number
  right: number
  bottom: number
}

export type TBoxBoundingInfo = {
  x: number
  y: number
  width: number
  height: number
}

export type TProductWithTemplate = TBaseProduct & {
  template: TPrintTemplate
}
