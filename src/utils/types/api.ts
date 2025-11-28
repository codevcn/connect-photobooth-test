export type TApiResponseBody<T> = {
  data: T
}

export type TListProductsCatalogRes = TProduct[]

export type TProduct = {
  id: number
  name: string
  slug: string
  base_image_url: string
  description: string
  status: TProductStatus
  detail_img: string[]
  attributes_json: Record<string, unknown> & {
    category?: string
    pages?: number[]
    material?: string
    theme?: string
  }
  created_at: string
  updated_at: string
  variants: TProductVariant[]
  surfaces: TProductSurface[]
  mockups: TProductMockup[]
}

/**
 * Attributes JSON structure for product variants
 * All fields are optional and can be null
 */
export type TProductVariantAttributesJson = {
  color?: string | null
  colorTitle?: string | null
  hex?: string | null // Hex color code starting with #
  size?: string | null
  sizeTitle?: string | null
  material?: string | null
  materialTitle?: string | null
  scent?: string | null
  scentTitle?: string | null
  // Legacy/custom fields
  binding?: string
  finish?: string
  fit?: string
  [key: string]: any // Allow custom attributes
}

export type TProductVariant = {
  id: number
  product_id: number
  sku: string
  price_amount_oneside: string
  price_amount_bothside: string | null
  currency: string
  stock_qty: number
  attributes_json: TProductVariantAttributesJson
  created_at: string
  updated_at: string
  variant_surfaces: [] // Deprecated, use mockups instead
}

export type TSurfaceCode = 'front' | 'back'

export type TProductSurface = {
  id: number
  product_id: number
  code: TSurfaceCode
  display_name: string
  preview_image_url: string
  order_index: number
  created_at: string
  updated_at: string
  print_areas: TPrintAreas
}

export type TPrintAreas = {
  width_px: number
  height_px: number
  x_px: number
  y_px: number
  width_real_px: number
  height_real_px: number
}
export type TOrderResponse = {
  order: TOrder
  store: TStore
  address: TAddress
  items: TOrderItem[]
  payments: TPayment[]
  shipments: TShipment[]
  discounts: TDiscount[]
  payment_instructions: TPaymentInstruction[]
}

export type TOrder = {
  id: number
  partner_id: number
  store_id: number
  hash_code: string
  external_order_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  status: TOrderStatus
  subtotal_amount: string
  discount_amount: string
  shipping_amount: string
  total_amount: string
  currency: string
  note: string | null
  domain_snapshot: string | null
  created_at: string
  updated_at: string
  store: {
    id: number
    name: string
  }
  items_count: number
}

export type TStore = {
  id: number
  code: string
  name: string
  routes: TStoreRoute[]
}

export type TStoreRoute = {
  id: number
  path_alias: string
  custom_domain: string
}

export type TAddress = {
  id: number
  city: string
  province: string
  country: TCountryCode
  created_at: string
  order_id: number
  address1: string
  postcode: string
}

export type TOrderItem = {
  id: number
  order_id: number
  product_id: number
  variant_id: number
  design_id: number
  quantity: number
  unit_price_amount: number
  item_note: string | null
  created_at: string
  product: {
    id: number
    name: string
  }
  variant: {
    id: number
    size: string
    color: string
  }
  design: TDesign
}

export type TDesign = {
  id: number
  surfaces: TDesignSurface[]
}

export type TDesignSurface = {
  id: number
  surface_id: number
  editor_state_json: Record<string, unknown>
  file_url: string
  width_px: number
  height_px: number
  generated_at: string
}

export type TPayment = Record<string, never> // trống trong dữ liệu hiện tại

export type TShipment = Record<string, never> // trống trong dữ liệu hiện tại

export type TDiscount = {
  id: number
  order_id: number
  discount_id: number
  code_snapshot: string
  type_snapshot: TDiscountTypeSnapshot
  value_snapshot: number
  amount_amount: number
  currency: string
  applied_at: string
}

export type TPaymentInstruction = {
  id: number
  order_id: number
  bin: string
  account_number: string
  account_name: string
  amount: string
  description: string
  order_code: string
  currency: string
  payment_link_id: string
  status: TPaymentInstructionStatus
  checkout_url: string
  qr_code: string
  created_at: string
  updated_at: string
}

export type TPaymentInstructionStatus = 'PENDING' | 'SUCCESS' | 'FAILED'

export type TDiscountTypeSnapshot = 'percent' | 'fixed'

export type TOrderStatus = 'pending_payment' | 'paid' | 'shipped' | 'completed' | 'cancelled'

export type TProductStatus = 'active' | 'inactive'

export type TCountryCode = 'VN'

// Create Order API Types
export type TCreateOrderReq = {
  store_code: string
  customer: {
    name: string
    email: string
    phone: string
  }
  shipping_address: {
    address1: string
    city: string
    province: string
    postcode: string
    country: string
  }
  items: {
    variant_id: number
    quantity: number
    item_note?: string
    surfaces: {
      surface_id: number
      editor_state_json: Record<string, unknown>
      file_url: string
      width_px: number
      height_px: number
    }[]
  }[]
  voucher_code?: string
  note?: string
}

export type TCreateOrderRes = TOrderResponse

export type TPreSentMockupImageRes = {
  filename: string
  mime_type: string
  size: number
  url: string
}

export type TOrderStatusRes = {
  id: number
  status: TOrderStatus
  is_paid: boolean
}

export type TAddressProvinceItem = {
  province_code: string
  name: string
}

/**
 * Product mockup with dynamic transform information
 * Each variant can have different print areas via transform_json
 */
export type TProductMockup = {
  variant_id: number
  surface_id: number
  mockup_url: string
  transform_json: {
    x_px?: number
    y_px?: number
    scale?: number
    width_px?: number
    height_px?: number
    width_real_px?: number
    height_real_px?: number
  }
  zindex_json: Record<string, unknown>
}

export type TAddressProvince = {
  id: number // ProvinceID (number)
  name: string // ProvinceName
  district_count: number
}

export type TAddressDistrict = {
  id: number // DistrictID
  name: string
  province_id: number
  ward_count: number
}

export type TAddressWard = {
  code: string // WardCode (string)
  name: string
  district_id: number
  province_id: number
}
