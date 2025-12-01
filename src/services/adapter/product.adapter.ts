import { TProduct, TProductVariant, TProductSurface, TProductMockup } from '@/utils/types/api'
import {
  TBaseProduct,
  TClientProductVariant,
  TPrintAreaInfo,
  TProductVariantSurface,
  TSurfaceType,
  TProductCategory,
  TMergedAttributes,
  TMergedAttributesUniqueString,
  TMergedAttributesGroups,
  TMergedAttributesUniqueColors,
  TPrintSurfaceInfo,
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

    return {
      id: apiProduct.id,
      url: apiProduct.base_image_url,
      name: apiProduct.name,
      description: apiProduct.description,
      detailImages: apiProduct.detail_img,
      variants: this.toClientVariants(apiProduct),
      inNewLine: false,
      printAreaList: this.toPrintAreaList(apiProduct),
      // variantSurfaces: this.toMockups(apiProduct.mockups),
      printSurfaces: this.toPrintSurfaces(apiProduct),
      mergedAttributes: buildProductAttributes(apiProduct.variants, apiProduct.id),
      slug: apiProduct.slug,
    }
  }

  static toPrintSurfaces(apiProduct: TProduct): TPrintSurfaceInfo[] {
    return apiProduct.surfaces.map((surface) => ({
      id: surface.id,
      productId: surface.product_id,
      code: surface.code,
      displayName: surface.display_name,
      previewImageUrl: surface.preview_image_url,
      orderIndex: surface.order_index,
      createdAt: surface.created_at,
      updatedAt: surface.updated_at,
    }))
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
      attributes: {
        material: attrs.material || undefined,
        materialTitle: attrs.materialTitle || undefined,
        scent: attrs.scent || undefined,
        scentTitle: attrs.scentTitle || undefined,
        color: attrs.color || undefined,
        colorTitle: attrs.colorTitle || undefined,
        hex: attrs.hex || undefined,
        size: attrs.size || undefined,
        sizeTitle: attrs.sizeTitle || undefined,
      },
      priceAmountOneSide: parseFloat(variant.price_amount_oneside),
      priceAmountBothSide: variant.price_amount_bothside
        ? parseFloat(variant.price_amount_bothside)
        : null,
      currency: variant.currency,
      category,
    }
  }

  /**
   * Convert surfaces sang print area list
   */
  private static toPrintAreaList(apiProduct: TProduct): TPrintAreaInfo[] {
    // Sort surfaces với 'front' đầu tiên
    // const sortedSurfaces = [...apiProduct.surfaces].sort((a, b) =>
    //   a.code === 'front' ? -1 : b.code === 'front' ? 1 : 0
    // )
    const sortedSurfaces: TPrintAreaInfo[] = []
    for (const mockup of apiProduct.mockups) {
      const surface = apiProduct.surfaces.find((s) => s.id === mockup.surface_id)
      if (!surface) continue
      sortedSurfaces.push(
        this.toPrintAreaInfo(
          mockup,
          surface,
          apiProduct.base_image_url,
          mockup.variant_id,
          apiProduct.id
        )
      )
    }
    return sortedSurfaces
  }

  /**
   * Convert surface sang TPrintAreaInfo
   */
  private static toPrintAreaInfo(
    mockup: TProductMockup,
    surface: TProductSurface,
    fallbackImageUrl: string,
    variantId: number,
    productId: TProduct['id']
  ): TPrintAreaInfo {
    const transform = mockup.transform_json
    const surfaceArea = surface.print_areas
    return {
      id: mockup.surface_id,
      variantId,
      area: {
        printX: transform.x_px || surfaceArea.x_px,
        printY: transform.y_px || surfaceArea.y_px,
        printW: transform.width_px || surfaceArea.width_px,
        printH: transform.height_px || surfaceArea.height_px,
        widthRealPx: transform.width_real_px || surfaceArea.width_real_px,
        heightRealPx: transform.height_real_px || surfaceArea.height_real_px,
        scale: transform.scale || surfaceArea.scale,
      },
      surfaceType: surface.code,
      imageUrl: mockup.mockup_url || fallbackImageUrl,
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

/**
 * Build hierarchical product attributes từ variants
 * Hierarchy: material → scent → color → size
 * Nếu không có material thì scent sẽ là phân cấp cao nhất, tương tự với các cấp khác
 */
// material -> scent -> color + hex -> sizes
function buildProductAttributes(variants: TProductVariant[], productId: number): TMergedAttributes {
  const groups: TMergedAttributesGroups = {}
  const uniqueMaterials: TMergedAttributesUniqueString = new Set()
  const uniqueScents: TMergedAttributesUniqueString = new Set()
  const uniqueColors: TMergedAttributesUniqueColors = {}
  const uniqueSizes: TMergedAttributesUniqueString = new Set()
  const uniqueMaterialTitles: TMergedAttributesUniqueString = new Set()
  const uniqueScentTitles: TMergedAttributesUniqueString = new Set()
  const uniqueColorTitles: TMergedAttributesUniqueString = new Set()
  const uniqueSizeTitles: TMergedAttributesUniqueString = new Set()
  let index: number = 0
  for (const variant of variants) {
    index += 1
    const attrs = variant.attributes_json || {}
    const material = attrs.material || 'null'
    const scent = attrs.scent || 'null'
    const color = attrs.color || 'null'
    const hex = attrs.hex || 'null'
    const size = attrs.size || 'null'
    const colorKey = `${color}`
    uniqueMaterials.add(material)
    uniqueMaterialTitles.add(attrs.materialTitle || 'Chất liệu')
    uniqueColors[color] = uniqueColors[color] || hex
    uniqueColorTitles.add(attrs.colorTitle || 'Màu sắc')
    uniqueSizes.add(size)
    uniqueSizeTitles.add(attrs.sizeTitle || 'Kích thước')
    uniqueScents.add(scent)
    uniqueScentTitles.add(attrs.scentTitle || 'Mùi hương')
    console.log(`>>> [index]1 ${index}:`, { material, scent, color, hex, size, groups, productId })
    if (!groups[material]) {
      groups[material] = {}
    }
    console.log('>>> [index]2', index, ':', groups)
    if (!groups[material][scent]) {
      groups[material][scent] = {}
    }
    console.log('>>> [index]3', index, ':', groups)
    if (!groups[material][scent][colorKey]) {
      groups[material][scent][colorKey] = {
        color,
        hex,
        sizes: null,
      }
    }
    console.log('>>> [index]4', index, ':', groups)
    groups[material][scent][colorKey].sizes = groups[material][scent][colorKey].sizes || []
    if (size !== 'null' && !groups[material][scent][colorKey].sizes!.includes(size)) {
      groups[material][scent][colorKey].sizes!.push(size)
    }
    console.log('>>> [index]5', index, ':', groups)
  }
  console.log('>>> [ser] groups:', {
    groups,
    productId,
    uniqueMaterials,
    uniqueScents,
    uniqueColors,
    uniqueSizes,
  })

  return {
    uniqueMaterials: Array.from(uniqueMaterials),
    uniqueMaterialTitles: Array.from(uniqueMaterialTitles),
    uniqueScents: Array.from(uniqueScents),
    uniqueScentTitles: Array.from(uniqueScentTitles),
    uniqueColors: uniqueColors,
    uniqueColorTitles: Array.from(uniqueColorTitles),
    uniqueSizes: Array.from(uniqueSizes),
    uniqueSizeTitles: Array.from(uniqueSizeTitles),
    groups,
  }
}
