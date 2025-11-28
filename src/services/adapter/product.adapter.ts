import { TProduct, TProductVariant, TProductSurface, TProductMockup } from '@/utils/types/api'
import {
  TBaseProduct,
  TClientProductVariant,
  TPrintAreaInfo,
  TProductVariantSurface,
  TSurfaceType,
  TProductCategory,
  TProductAttributes,
  TColorAttribute,
  TMaterialAttribute,
  TScentAttribute,
  TSizeAttribute,
} from '@/utils/types/global'

/**
 * ProductAdapter - Chuyển đổi dữ liệu sản phẩm từ API sang cấu trúc Client
 */
export class ProductAdapter {
  /**
   * Convert một product từ API sang TBaseProduct
   */
  static toClientProduct(apiProduct: TProduct): TBaseProduct | null {
    // Validate product
    if (apiProduct.status !== 'active') return null
    if (apiProduct.variants.length === 0) return null
    if (apiProduct.surfaces.length === 0) return null

    const clientVariants = this.toClientVariants(apiProduct)

    return {
      id: apiProduct.id,
      url: apiProduct.base_image_url,
      name: apiProduct.name,
      description: apiProduct.description,
      detailImages: apiProduct.detail_img,
      variants: clientVariants,
      inNewLine: false,
      printAreaList: this.toPrintAreaList(apiProduct),
      variantSurfaces: this.toMockups(apiProduct.mockups),
      mergedAttributes: this.mergeVariantAttributes(clientVariants),
      slug: apiProduct.slug,
    }
  }

  /**
   * Convert danh sách products từ API sang TBaseProduct[]
   */
  static toClientProducts(apiProducts: TProduct[]): TBaseProduct[] {
    const clientProducts: TBaseProduct[] = []
    for (const product of apiProducts) {
      const clientProduct = this.toClientProduct(product)
      if (clientProduct) {
        clientProducts.push(clientProduct)
      }
    }
    return clientProducts
  }

  /**
   * Convert variants từ API sang TClientProductVariant[]
   */
  private static toClientVariants(apiProduct: TProduct): TClientProductVariant[] {
    const category = this.extractCategory(apiProduct.attributes_json)

    return apiProduct.variants.map((variant) => this.toClientVariant(variant, apiProduct, category))
  }

  /**
   * Convert một variant sang TClientProductVariant
   */
  private static toClientVariant(
    variant: TProductVariant,
    product: TProduct,
    category?: TProductCategory
  ): TClientProductVariant {
    const attrs = variant.attributes_json || {}

    return {
      id: variant.id,
      name: product.name,
      attributes: attrs,
      priceAmountOneSide: parseFloat(variant.price_amount_oneside),
      priceAmountBothSide: variant.price_amount_bothside
        ? parseFloat(variant.price_amount_bothside)
        : null,
      currency: variant.currency,
      stock: variant.stock_qty,
      category,
    }
  }

  /**
   * Merge variants thành cấu trúc phân cấp attributes
   * Độ ưu tiên: material -> scent -> color -> size
   */
  static mergeVariantAttributes(variants: TClientProductVariant[]): TProductAttributes {
    const result: TProductAttributes = {}

    // Collect unique values
    const materials = new Set<string>()
    const scents = new Set<string>()
    const colors = new Map<string, { hex?: string; title?: string }>()
    const sizes = new Set<string>()

    let materialTitle: string | null = null
    let scentTitle: string | null = null
    let colorTitle: string | null = null
    let sizeTitle: string | null = null

    for (const variant of variants) {
      const attrs = variant.attributes

      // Material
      if (attrs.material) {
        materials.add(attrs.material)
        if (attrs.materialTitle) materialTitle = attrs.materialTitle
      }

      // Scent
      if (attrs.scent) {
        scents.add(attrs.scent)
        if (attrs.scentTitle) scentTitle = attrs.scentTitle
      }

      // Color - Handle cases 1, 2, 3
      if (attrs.color !== null && attrs.color !== undefined) {
        if (!colors.has(attrs.color)) {
          colors.set(attrs.color, {
            hex: attrs.hex || undefined,
            title: attrs.colorTitle || undefined,
          })
        }
        if (attrs.colorTitle) colorTitle = attrs.colorTitle
      }

      // Size
      if (attrs.size) {
        sizes.add(attrs.size.toUpperCase())
        if (attrs.sizeTitle) sizeTitle = attrs.sizeTitle
      }
    }

    // Build result theo thứ tự: material -> scent -> color -> size
    if (materials.size > 0) {
      result.materials = {
        title: materialTitle || 'Chất liệu',
        options: Array.from(materials).map((m) => ({
          value: m,
          displayValue: m,
        })),
      }
    }

    if (scents.size > 0) {
      result.scents = {
        title: scentTitle || 'Mùi hương',
        options: Array.from(scents).map((s) => ({
          value: s,
          displayValue: s,
        })),
      }
    }

    if (colors.size > 0) {
      result.colors = {
        title: colorTitle || 'Màu sắc',
        options: Array.from(colors.entries()).map(([color, data]) => ({
          value: color,
          displayValue: color,
          hex: data.hex,
          displayType: (data.hex ? 'swatch' : 'label') as 'swatch' | 'label',
        })),
      }
    }

    if (sizes.size > 0) {
      result.sizes = {
        title: sizeTitle || 'Kích thước',
        options: Array.from(sizes).map((s) => ({
          value: s,
          displayValue: s,
        })),
      }
    }

    return result
  }

  /**
   * Convert surfaces sang print area list
   */
  private static toPrintAreaList(apiProduct: TProduct): TPrintAreaInfo[] {
    // Sort surfaces với 'front' đầu tiên
    const sortedSurfaces = [...apiProduct.surfaces].sort((a, b) =>
      a.code === 'front' ? -1 : b.code === 'front' ? 1 : 0
    )

    const printAreas: TPrintAreaInfo[] = []
    for (const surface of sortedSurfaces) {
      if (surface.code === 'front' || surface.code === 'back') {
        printAreas.push(this.toPrintAreaInfo(surface, apiProduct.base_image_url))
      }
    }
    return printAreas
  }

  /**
   * Convert surface sang TPrintAreaInfo
   */
  private static toPrintAreaInfo(
    surface: TProductSurface,
    fallbackImageUrl: string
  ): TPrintAreaInfo {
    return {
      id: surface.id,
      area: {
        printX: surface.print_areas.x_px,
        printY: surface.print_areas.y_px,
        printW: surface.print_areas.width_px,
        printH: surface.print_areas.height_px,
        widthRealPx: surface.print_areas.width_real_px,
        heightRealPx: surface.print_areas.height_real_px,
      },
      surfaceType: surface.code as TSurfaceType,
      imageUrl: surface.preview_image_url || fallbackImageUrl,
    }
  }

  /**
   * Convert mockups với transform_json sang variant surfaces
   */
  private static toMockups(mockups: TProductMockup[]): TProductVariantSurface[] {
    return mockups.map((mockup) => ({
      variantId: mockup.variant_id,
      surfaceId: mockup.surface_id,
      imageURL: mockup.mockup_url,
      transform: mockup.transform_json || {},
    }))
  }

  /**
   * Extract category từ attributes_json
   */
  private static extractCategory(
    attributes: TProduct['attributes_json']
  ): TProductCategory | undefined {
    return attributes.category as TProductCategory | undefined
  }
}
