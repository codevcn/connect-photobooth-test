import { TProduct, TProductVariant, TProductSurface } from '@/utils/types/api'
import {
  TBaseProduct,
  TClientProductVariant,
  TPrintAreaInfo,
  TProductVariantSurface,
  TProductSize,
  TSurfaceType,
  TProductCategory,
  TProductColor,
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
      variantSurfaces: this.toVariantSurfacesFromVariants(apiProduct),
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
    const attrs = (variant as any).attributes_json || {}
    const color = attrs.color as string | undefined
    const hex = attrs.hex as string | undefined
    const colorTitle = attrs.colorTitle as string | undefined
    const size = attrs.size as string | undefined
    const sizeTitle = attrs.sizeTitle as string | undefined
    const material = attrs.material as string | undefined
    const materialTitle = attrs.materialTitle as string | undefined
    const scent = attrs.scent as string | undefined
    const scentTitle = attrs.scentTitle as string | undefined

    const clientColor = (() => {
      // Case 1: color != null and hex != null → dùng chip màu theo hex, title là color
      if (color && hex) {
        return {
          title: color,
          value: hex,
          withTitleFromServer: colorTitle
            ? { title: colorTitle, text: color }
            : undefined,
        } as TProductColor
      }
      // Case 2: color != null and hex == null → hiển thị theo label từ server (đã chuẩn hoá)
      if (color && !hex) {
        return {
          title: color,
          value: color,
          withTitleFromServer: colorTitle
            ? { title: colorTitle, text: color }
            : undefined,
        } as TProductColor
      }
      // Case 3: color == null → không hiển thị phần màu (đặt mặc định)
      return { title: 'N/A', value: 'transparent' } as TProductColor
    })()

    const clientSize = (size || 'N/A').toString().toUpperCase() as TProductSize

    return {
      id: variant.id,
      name: product.name,
      size: clientSize,
      color: clientColor,
      material,
      materialTitle,
      scent,
      scentTitle,
      sizeTitle,
      priceAmountOneSide: parseFloat(String(variant.price_amount_oneside ?? '0')),
      priceAmountBothSide: parseFloat(String(variant.price_amount_bothside ?? '0')),
      currency: variant.currency ?? 'VND',
      stock: (variant as any).stock_qty ?? 0,
      category,
    }
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
   * Convert mockups sang variant surfaces
   */
  private static toVariantSurfacesFromVariants(apiProduct: TProduct): TProductVariantSurface[] {
    const out: TProductVariantSurface[] = []
    for (const v of apiProduct.variants) {
      const variantSurfaces = (v as any).variant_surfaces || []
      for (const vs of variantSurfaces) {
        const transform = vs.transform_json || {}
        out.push({
          variantId: vs.variant_id ?? v.id,
          surfaceId: vs.surface_id,
          imageURL: vs.mockup_url,
          transformArea: {
            printX: Number(transform.x_px ?? 0),
            printY: Number(transform.y_px ?? 0),
            printW: Number(transform.width_px ?? 0),
            printH: Number(transform.height_px ?? 0),
            widthRealPx: Number(transform.width_real_px ?? 0),
            heightRealPx: Number(transform.height_real_px ?? 0),
          },
        })
      }
    }
    return out
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
