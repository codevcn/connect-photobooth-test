export type TIntersectSameFields<A, B> = {
  [K in keyof A & keyof B as A[K] extends B[K] ? (B[K] extends A[K] ? K : never) : never]: A[K]
}

export type TProductSize = 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL'

export type TProductColor = {
  title: string
  value: string
  withTitleFromServer?: {
    title: string
    text: string
  }
}

/**
 * Generic attribute option for material, scent, size, etc.
 */
export type TAttributeOption = {
  value: string
  displayValue: string
  title?: string
}

export type TMergedAttributesColorHexGroup = {
  color: string
  hex: string
  sizes: string[] | null
}

export type TMergedAttributesGroups = {
  [material: string]: {
    [scent: string]: {
      [colorHex: string]: TMergedAttributesColorHexGroup
    }
  }
}

export type TMergedAttributesUniqueColors = { [key: string]: string }

export type TMergedAttributesUniqueString = Set<string>

export type TMergedAttributes = {
  uniqueMaterials: string[]
  uniqueMaterialTitles: string[]
  uniqueScents: string[]
  uniqueScentTitles: string[]
  uniqueColors: TMergedAttributesUniqueColors
  uniqueColorTitles: string[]
  uniqueSizes: string[]
  uniqueSizeTitles: string[]
  groups: TMergedAttributesGroups
}

export type TProductVariantSurface = {
  variantId: number
  surfaceId: number
  imageURL: string
  transform?: {
    x_px?: number
    y_px?: number
    width_px?: number
    height_px?: number
    width_real_px?: number
    height_real_px?: number
  }
}

export type TPrintAreaInfo = {
  id: number // product surface id
  variantId: number
  area: {
    printX: number // pixel position x
    printY: number // pixel position y
    printW: number // pixel width
    printH: number // pixel height
    widthRealPx: number // real width of product image (for exporting)
    heightRealPx: number // real height of product image (for exporting)
    scale: number
  }
  surfaceType: TSurfaceType
  imageUrl: string
}

export type TPrintSurfaceInfo = {
  id: number
  productId: number
  code: TSurfaceType
  displayName: string
  previewImageUrl: string
  orderIndex: number
  createdAt: string
  updatedAt: string
}

export type TBaseProduct = {
  id: number
  url: string
  name: string
  description: string
  variants: TClientProductVariant[]
  detailImages: string[]
  inNewLine: boolean
  printAreaList: TPrintAreaInfo[] // field mockups từ api
  mergedAttributes: TMergedAttributes // NEW: Merged attributes from all variants
  slug: string
  printSurfaces: TPrintSurfaceInfo[]
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
  attributes: {
    color?: string
    colorTitle?: string
    hex?: string
    size?: string
    sizeTitle?: string
    material?: string
    materialTitle?: string
    scent?: string
    scentTitle?: string
    [key: string]: any
  }
  priceAmountOneSide: number
  priceAmountBothSide: number | null
  currency: string
  priceAfterDiscount?: number
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

export type TDetectCollisionWithViewportEdgesResult = {
  collidedEdge: 'left' | 'right' | 'top' | 'bottom' | null
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
  discount?: number // Total discount amount calculated by API
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

export type TTextVisualState = TElementVisualBaseState & {
  id: string
  fontSize: number
  textColor: string
  content: string
  fontFamily: string
  fontWeight: number
  mountType?: TElementMountType
}

export type TStickerVisualState = TElementVisualBaseState & {
  id: string
  path: string
  mountType?: TElementMountType
  height?: number
  width?: number
}

export type TPrintedImageVisualState = TStickerVisualState

export type TStoredTemplate = TPrintTemplate

export type TElementsVisualState = Partial<{
  stickers: TStickerVisualState[]
  storedTemplates: TStoredTemplate[]
  texts: TTextVisualState[]
  printedImages: TPrintedImageVisualState[]
}>

export type TMockupImageData = {
  dataUrl: string
  size: {
    width: number
    height: number
  }
}

export type TMockupDataId = string

export type TMockupData = {
  id: TMockupDataId
  elementsVisualState: TElementsVisualState
  imageData: TMockupImageData
  preSentImageLink?: string
  surfaceInfo: {
    id: number
    type: TSurfaceType
  }
  quantity: number
}

export type TProductVariantInCart = {
  variantId: TClientProductVariant['id']
  mockupDataList: TMockupData[]
}

export type TProductInCart = TProductCartInfo & {
  productVariants: TProductVariantInCart[]
}

export type TProductCartInfo = {
  productId: number
  productName: string
}

export type TSavedMockupData = {
  sessionId: string
  productsInCart: TProductInCart[]
}

export type TSurfaceType = 'front' | 'back' | 'both'

export type TPaymentProductItem = {
  productId: number
  productVariantId: number
  name: string
  variantAttributesInfo: {
    material?: {
      title: string
      value: string
    }
    scent?: {
      title: string
      value: string
    }
    color?: {
      title: string
      value: string
    }
    size?: {
      title: string
      value: string
    }
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
  initialVisualState?: Partial<{
    offsetY: number
    offsetX: number
    grayscale?: number // 0-100 percentage
  }>
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
  prrintedImageWidth: number
  printedImageHeight: number
  initialVisualState?: Partial<{
    zoom: number
  }>
}

export type TPlacementState = {
  frameIndex: number
  zoom: number
  objectFit: 'contain' | 'cover'
  squareRotation: number
  direction: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

export type TTextFont = {
  fontFamily: string
  loadFontURL: string
  fontWeight: string
  fontDisplay: string
  fontStyle: string
  fontFormat: string
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

export type TShapeOrientationType = 'portrait' | 'landscape' | 'square'

export type TPrintAreaShapeType = TShapeOrientationType

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

export type TPlacedImageMetaData = {
  // placedImageId: string
  // templateType: TTemplateType
  // frameIndex: TTemplateFrame['index']
  placedImageInitialSize: TSizeInfo
  frameInitialSize: TSizeInfo
}

export type TProductAttatchedData = {
  productId: TBaseProduct['id']
  productNote?: string
}

export type TPosition = {
  x: number
  y: number
}

export type TElementMountType = 'from-new' | 'from-saved'

export type TElementRelativeProps = {
  element: {
    left: number
    top: number
  }
}

export type TEditMode = 'with-template' | 'no-template'
