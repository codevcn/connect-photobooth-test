import { TBaseProduct, TClientProductVariant } from '@/utils/types/global'
import { getFetchProductsCatalog, postPreSendMockupImage } from './api/product.api'
import { TPreSentMockupImageRes, TProduct, TProductVariant } from '@/utils/types/api'
import { ProductAdapter } from './adapter/product.adapter'
import { extractIntegerFromString, sortSizes } from '@/utils/helpers'

// ============================================================================
// Color Sorting Utilities - Sort variants by color brightness (dark → light)
// ============================================================================

type RGB = { r: number; g: number; b: number }

/**
 * Clamp value to 0-255 range
 */
const clamp255 = (n: number): number => Math.max(0, Math.min(255, n))

/**
 * Parse hex color string to RGB object
 * Supports both #RGB and #RRGGBB formats
 */
const parseHexToRgb = (input: string): RGB | null => {
  if (!input) return null
  let hex = input.trim().replace(/^#/, '')

  // #RGB → #RRGGBB
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('')
  }

  // Validate #RRGGBB
  if (hex.length !== 6) return null
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null

  const n = parseInt(hex, 16)
  return {
    r: clamp255((n >> 16) & 0xff),
    g: clamp255((n >> 8) & 0xff),
    b: clamp255(n & 0xff),
  }
}

/**
 * Calculate relative luminance according to WCAG standard
 * @returns Value between 0 (black) and 1 (white)
 */
const calculateLuminance = ({ r, g, b }: RGB): number => {
  const toLinear = (v255: number): number => {
    const v = v255 / 255
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }

  const R = toLinear(r)
  const G = toLinear(g)
  const B = toLinear(b)

  // Weighted sum - human eye is most sensitive to green
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

/**
 * Get luminance value for a variant based on its hex color
 * @returns Luminance value (0-1), or Infinity if no valid color
 */
const getVariantLuminance = (variant: TProductVariant): number => {
  const hex = variant.attributes_json.hex
  if (!hex) return Number.POSITIVE_INFINITY

  const rgb = parseHexToRgb(hex)
  if (!rgb) return Number.POSITIVE_INFINITY

  return calculateLuminance(rgb)
}

/**
 * Sort product variants by color brightness (dark → light)
 * Variants without valid hex color will be placed at the end
 */
const sortVariantsByColorBrightness = (variants: TProductVariant[]): TProductVariant[] => {
  return [...variants].sort((a, b) => {
    const lumA = getVariantLuminance(a)
    const lumB = getVariantLuminance(b)
    return lumA - lumB
  })
}

/**
 * Sort all variants in each product by color brightness
 */
const sortProductVariantsByColor = (product: TProduct): TProduct => {
  return {
    ...product,
    variants: sortVariantsByColorBrightness(product.variants),
  }
}

const sortVariantsBySize = (product: TProduct): TProduct => {
  const variants = product.variants
  variants.sort((a, b) => {
    const aSize = a.attributes_json.size || ''
    const bSize = b.attributes_json.size || ''
    const parsedA = extractIntegerFromString(aSize)
    const parsedB = extractIntegerFromString(bSize)
    if (parsedA && parsedB) {
      return parsedB - parsedA
    }
    return aSize.localeCompare(bSize, 'vi')
  })
  return {
    ...product,
    variants,
  }
}

const sortProductsHandler = (products: TProduct[]): TProduct[] => {
  return products.map((product) => {
    if (product.id === 21) {
      return sortVariantsBySize(product)
    }
    return sortProductVariantsByColor(product)
  })
}

// ============================================================================
// Product Service
// ============================================================================

class ProductService {
  /**
   * Fetch products from API and convert to TBaseProduct format
   */
  private async fetchProducts(page: number, pageSize: number): Promise<TBaseProduct[]> {
    const response = await getFetchProductsCatalog(page, pageSize)

    if (!response.success || !response.data?.data) {
      throw new Error(response.error || 'Không thể lấy danh sách sản phẩm từ server')
    }

    const apiProducts = response.data.data
    console.log('>>> [ser] api products:', apiProducts)

    // Sort variants trong mỗi product theo màu từ tối đến sáng
    const productsWithSortedVariants = sortProductsHandler(apiProducts)
    console.log('>>> [ser] products with sorted variants:', productsWithSortedVariants)

    // Sử dụng ProductAdapter để convert
    const clientProducts = ProductAdapter.toClientProducts(productsWithSortedVariants)
    console.log('>>> [ser] client products:', clientProducts)

    clientProducts.sort((a, b) => a.slug.localeCompare(b.slug))
    return clientProducts
  }

  /**
   * Main method - fetch from API with cache support
   */
  async fetchProductsByPage(page: number, limit: number): Promise<TBaseProduct[]> {
    return this.fetchProducts(page, limit)
  }

  async preSendMockupImage(image: Blob, filename: string): Promise<TPreSentMockupImageRes> {
    console.log('>>> [ser] pre sent image:', { image, filename })
    const formData = new FormData()
    formData.append('file', image, filename)
    const response = await postPreSendMockupImage(formData)
    console.log('>>> [ser] pre send res:', response)
    if (!response.success || !response.data?.data) {
      throw new Error(response.error || 'Không thể gửi mockup image đến server')
    }
    return response.data.data
  }
}

export const productService = new ProductService()
