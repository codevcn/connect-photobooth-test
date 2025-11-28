import { TBaseProduct } from '@/utils/types/global'
import { getFetchProductsCatalog, postPreSendMockupImage } from './api/product.api'
import { TPreSentMockupImageRes } from '@/utils/types/api'
import { ProductAdapter } from './adapter/product.adapter'
import { apiCache } from '@/dev/api-cache'

// Cache keys
const CACHE_KEYS = {
  PRODUCTS: (page: number, limit: number) => `new_products_${page}_${limit}`,
}

// Cache TTL: 30 minutes for product data
const PRODUCT_CACHE_TTL = 900000 * 60 * 1000

class ProductService {
  /**
   * Fetch products from API and convert to TBaseProduct format
   */
  private async fetchProducts(page: number, pageSize: number): Promise<TBaseProduct[]> {
    const response = await getFetchProductsCatalog(page, pageSize)

    if (!response.success || !response.data?.data) {
      throw new Error(response.error || 'Không thể lấy danh sách sản phẩm từ server')
    }

    const apiProducts = {
      expiresAt: 1818345067141,
      timestamp: 1764345067141,
      data: [
        {
          id: 6,
          name: 'NAT',
          slug: 'a',
          base_image_url: 'https://api.encycom.com/files/1764149687071-142009101.png',
          description: 'abc',
          status: 'active',
          attributes_json: {},
          detail_img: [],
          created_at: '2025-11-28T09:47:07.810Z',
          updated_at: '2025-11-28T09:47:07.810Z',
          variants: [
            {
              id: 22,
              product_id: 6,
              sku: 'A-M-RED',
              price_amount_oneside: '0',
              price_amount_bothside: null,
              currency: 'VND',
              attributes_json: {
                size: 'M',
                color: 'Red',
              },
              created_at: '2025-11-28T10:27:55.628Z',
              updated_at: '2025-11-28T10:27:55.628Z',
              variant_surfaces: [],
            },
            {
              id: 21,
              product_id: 6,
              sku: 'A-S-RED',
              price_amount_oneside: '0',
              price_amount_bothside: null,
              currency: 'VND',
              attributes_json: {
                size: 'S',
                color: 'Red',
              },
              created_at: '2025-11-28T10:27:55.070Z',
              updated_at: '2025-11-28T10:27:55.070Z',
              variant_surfaces: [
                {
                  variant_id: 21,
                  surface_id: 14,
                  mockup_url: 'https://api.encycom.com/files/1764132499796-164219352.png',
                  transform_json: {
                    x_px: 399,
                    y_px: 552,
                    scale: 10,
                    width_px: 120,
                    height_px: 120,
                    width_real_px: 12,
                    height_real_px: 12,
                  },
                  zindex_json: {},
                },
                {
                  variant_id: 21,
                  surface_id: 13,
                  mockup_url: 'https://api.encycom.com/files/1764142924113-388799860.png',
                  transform_json: {
                    x_px: 433,
                    y_px: 529,
                    scale: 0.367,
                    width_px: 367,
                    height_px: 367,
                    width_real_px: 1000,
                    height_real_px: 1000,
                  },
                  zindex_json: {},
                },
              ],
            },
          ],
          surfaces: [
            {
              id: 13,
              product_id: 6,
              code: 'front',
              display_name: 'Mặt trước',
              preview_image_url: 'https://api.encycom.com/files/1764142918834-809603078.png',
              order_index: 0,
              created_at: '2025-11-28T09:47:25.427Z',
              updated_at: '2025-11-28T10:31:33.120Z',
              print_areas: {
                width_px: 265,
                height_px: 265,
                x_px: 96,
                y_px: 66,
                width_real_px: 1000,
                height_real_px: 1000,
              },
            },
            {
              id: 14,
              product_id: 6,
              code: 'back',
              display_name: 'Mặt sau',
              preview_image_url: 'https://api.encycom.com/files/1764142911601-214975311.png',
              order_index: 1,
              created_at: '2025-11-28T10:31:42.380Z',
              updated_at: '2025-11-28T10:31:42.380Z',
              print_areas: {
                width_px: 120,
                height_px: 120,
                x_px: 430,
                y_px: 566,
                width_real_px: 12,
                height_real_px: 12,
              },
            },
          ],
          mockups: [
            {
              variant_id: 21,
              surface_id: 14,
              mockup_url: 'https://api.encycom.com/files/1764142904392-870852612.png',
              transform_json: {
                x_px: 399,
                y_px: 552,
                scale: 10,
                width_px: 120,
                height_px: 120,
                width_real_px: 12,
                height_real_px: 12,
              },
              zindex_json: {},
            },
            {
              variant_id: 21,
              surface_id: 13,
              mockup_url: 'https://api.encycom.com/files/1764142898923-103758839.png',
              transform_json: {
                x_px: 433,
                y_px: 529,
                scale: 0.367,
                width_px: 367,
                height_px: 367,
                width_real_px: 1000,
                height_real_px: 1000,
              },
              zindex_json: {},
            },
          ],
        },
        {
          id: 4,
          name: 'Retro Photobooth Frame',
          slug: 'retro-photobooth-frame',
          base_image_url: 'https://api.encycom.com/files/1764142891300-24387094.png',
          description: 'Wooden tabletop frame with customizable double-sided inserts.',
          status: 'active',
          attributes_json: {
            category: 'frame',
            material: 'wood',
          },
          detail_img: [],
          created_at: '2025-11-12T23:38:13.898Z',
          updated_at: '2025-11-12T23:38:13.898Z',
          variants: [
            {
              id: 6,
              product_id: 4,
              sku: 'FRAME-OAK',
              price_amount_oneside: '380000',
              price_amount_bothside: '400000',
              currency: 'VND',
              attributes_json: {
                finish: 'matte',
              },
              created_at: '2025-11-12T23:38:13.898Z',
              updated_at: '2025-11-12T23:38:13.898Z',
              variant_surfaces: [],
            },
            {
              id: 7,
              product_id: 4,
              sku: 'FRAME-WALNUT',
              price_amount_oneside: '420000',
              price_amount_bothside: '450000',
              currency: 'VND',
              attributes_json: {
                finish: 'glossy',
              },
              created_at: '2025-11-12T23:38:13.898Z',
              updated_at: '2025-11-12T23:38:13.898Z',
              variant_surfaces: [],
            },
          ],
          surfaces: [],
          mockups: [],
        },
        {
          id: 2,
          name: 'Premium Photobooth T-Shirt',
          slug: 'premium-photobooth-tshirt',
          base_image_url: 'https://api.encycom.com/files/1764142886362-531576746.png',
          description: 'Soft cotton tee with high quality DTG zone for photobooth compositions.',
          status: 'active',
          attributes_json: {
            theme: 'premium',
            category: 'tshirt',
          },
          detail_img: [],
          created_at: '2025-11-12T23:38:13.898Z',
          updated_at: '2025-11-13T23:44:08.291Z',
          variants: [
            {
              id: 3,
              product_id: 2,
              sku: 'TSHIRT-WHITE-M',
              price_amount_oneside: '300000',
              price_amount_bothside: '340000',
              currency: 'VND',
              attributes_json: {
                fit: 'classic',
                material: 'cotton',
              },
              created_at: '2025-11-12T23:38:13.898Z',
              updated_at: '2025-11-12T23:38:13.898Z',
              variant_surfaces: [
                {
                  variant_id: 3,
                  surface_id: 4,
                  mockup_url: 'https://api.encycom.com/files/1764142873215-569814298.png',
                  transform_json: {
                    x_px: 445,
                    y_px: 260,
                    scale: 3.468560354646681,
                    width_px: 2744,
                    height_px: 921,
                    width_real_px: 791,
                    height_real_px: 266,
                  },
                  zindex_json: {},
                },
                {
                  variant_id: 3,
                  surface_id: 3,
                  mockup_url: 'https://api.encycom.com/files/1764142833872-191321743.png',
                  transform_json: {
                    x_px: 150,
                    y_px: 379,
                    scale: 1.6066666666666667,
                    width_px: 723,
                    height_px: 883.6666666666666,
                    width_real_px: 450,
                    height_real_px: 550,
                  },
                  zindex_json: {},
                },
              ],
            },
            {
              id: 2,
              product_id: 2,
              sku: 'TSHIRT-BLACK-L',
              price_amount_oneside: '320000',
              price_amount_bothside: '360000',
              currency: 'VND',
              attributes_json: {
                fit: 'unisex',
                material: 'cotto  n',
              },
              created_at: '2025-11-12T23:38:13.898Z',
              updated_at: '2025-11-28T08:16:21.806Z',
              variant_surfaces: [],
            },
          ],
          surfaces: [
            {
              id: 4,
              product_id: 2,
              code: 'back',
              display_name: 'Back Graphic',
              preview_image_url: 'https://api.encycom.com/files/1764142828848-309823356.png',
              order_index: 1,
              created_at: '2025-11-12T23:38:13.898Z',
              updated_at: '2025-11-14T00:03:54.316Z',
              print_areas: {
                width_px: 1124,
                height_px: 1392,
                x_px: 320,
                y_px: 260,
                width_real_px: 420,
                height_real_px: 520,
              },
            },
            {
              id: 3,
              product_id: 2,
              code: 'front',
              display_name: 'Front Graphic',
              preview_image_url: 'https://api.encycom.com/files/1764142821864-86438459.png',
              order_index: 0,
              created_at: '2025-11-12T23:38:13.898Z',
              updated_at: '2025-11-13T23:44:26.941Z',
              print_areas: {
                width_px: 769,
                height_px: 940,
                x_px: 197,
                y_px: 340,
                width_real_px: 450,
                height_real_px: 550,
              },
            },
          ],
          mockups: [
            {
              variant_id: 3,
              surface_id: 4,
              mockup_url: 'https://api.encycom.com/files/1764142816478-996455213.png',
              transform_json: {
                x_px: 445,
                y_px: 260,
                scale: 3.468560354646681,
                width_px: 2744,
                height_px: 921,
                width_real_px: 791,
                height_real_px: 266,
              },
              zindex_json: {},
            },
            {
              variant_id: 3,
              surface_id: 3,
              mockup_url: 'https://api.encycom.com/files/1764142808483-834215140.png',
              transform_json: {
                x_px: 150,
                y_px: 379,
                scale: 1.6066666666666667,
                width_px: 723,
                height_px: 883.6666666666666,
                width_real_px: 450,
                height_real_px: 550,
              },
              zindex_json: {},
            },
          ],
        },
        {
          id: 3,
          name: 'Mini Photobooth Album',
          slug: 'mini-photobooth-album',
          base_image_url: 'https://api.encycom.com/files/1764142802225-737056445.png',
          description: 'Compact photo album with customizable cover and inner sleeves.',
          status: 'active',
          attributes_json: {
            pages: [20, 40],
            category: 'album',
          },
          detail_img: [],
          created_at: '2025-11-12T23:38:13.898Z',
          updated_at: '2025-11-12T23:38:13.898Z',
          variants: [
            {
              id: 8,
              product_id: 3,
              sku: 'a',
              price_amount_oneside: '20',
              price_amount_bothside: '0',
              currency: 'VND',
              attributes_json: {},
              created_at: '2025-11-14T07:16:36.673Z',
              updated_at: '2025-11-14T07:16:36.673Z',
              variant_surfaces: [
                {
                  variant_id: 8,
                  surface_id: 12,
                  mockup_url: 'https://api.encycom.com/files/1764142795469-202037256.png',
                  transform_json: {},
                  zindex_json: {},
                },
              ],
            },
            {
              id: 4,
              product_id: 3,
              sku: 'ALBUM-20P',
              price_amount_oneside: '450000',
              price_amount_bothside: '480000',
              currency: 'VND',
              attributes_json: {
                binding: 'layflat',
              },
              created_at: '2025-11-12T23:38:13.898Z',
              updated_at: '2025-11-12T23:38:13.898Z',
              variant_surfaces: [
                {
                  variant_id: 4,
                  surface_id: 12,
                  mockup_url: 'https://api.encycom.com/files/1764142788786-455547029.png',
                  transform_json: {},
                  zindex_json: {},
                },
              ],
            },
            {
              id: 5,
              product_id: 3,
              sku: 'ALBUM-40P',
              price_amount_oneside: '520000',
              price_amount_bothside: '560000',
              currency: 'VND',
              attributes_json: {
                binding: 'layflat',
              },
              created_at: '2025-11-12T23:38:13.898Z',
              updated_at: '2025-11-12T23:38:13.898Z',
              variant_surfaces: [
                {
                  variant_id: 5,
                  surface_id: 12,
                  mockup_url: 'https://api.encycom.com/files/1764142783358-156345759.png',
                  transform_json: {},
                  zindex_json: {},
                },
              ],
            },
          ],
          surfaces: [
            {
              id: 12,
              product_id: 3,
              code: 'front',
              display_name: 'Mặt trước',
              preview_image_url: 'https://api.encycom.com/files/1764142771698-722230712.png',
              order_index: 0,
              created_at: '2025-11-24T13:40:59.010Z',
              updated_at: '2025-11-24T13:44:09.264Z',
              print_areas: {
                width_px: 508,
                height_px: 1016,
                x_px: 223,
                y_px: 250,
                width_real_px: 100,
                height_real_px: 200,
              },
            },
          ],
          mockups: [
            {
              variant_id: 8,
              surface_id: 12,
              mockup_url: 'https://api.encycom.com/files/1764142864475-290353952.png',
              transform_json: {},
              zindex_json: {},
            },
            {
              variant_id: 4,
              surface_id: 12,
              mockup_url: 'https://api.encycom.com/files/1764142859207-422462466.png',
              transform_json: {},
              zindex_json: {},
            },
            {
              variant_id: 5,
              surface_id: 12,
              mockup_url: 'https://api.encycom.com/files/1764142853594-591231767.png',
              transform_json: {},
              zindex_json: {},
            },
          ],
        },
        {
          id: 1,
          name: 'Classic Photobooth Mug',
          slug: 'classic-photobooth-mug',
          base_image_url: 'https://api.encycom.com/files/1764142847897-575889817.png',
          description: 'A ceramic mug customized via photobooth editor.',
          status: 'active',
          attributes_json: {
            category: 'mug',
          },
          detail_img: [],
          created_at: '2025-11-11T20:09:18.400Z',
          updated_at: '2025-11-17T02:25:29.891Z',
          variants: [
            {
              id: 1,
              product_id: 1,
              sku: 'MUG-WHITE-11OZ',
              price_amount_oneside: '2000',
              price_amount_bothside: '4000',
              currency: 'VND',
              attributes_json: {
                material: 'ceramic',
              },
              created_at: '2025-11-11T20:09:18.400Z',
              updated_at: '2025-11-13T02:36:40.536Z',
              variant_surfaces: [],
            },
          ],
          surfaces: [
            {
              id: 1,
              product_id: 1,
              code: 'front',
              display_name: 'Front Surface',
              preview_image_url: 'https://api.encycom.com/files/1764142935722-637847636.png',
              order_index: 0,
              created_at: '2025-11-11T20:09:18.400Z',
              updated_at: '2025-11-12T00:06:25.915Z',
              print_areas: {
                width_px: 605,
                height_px: 726,
                x_px: 153,
                y_px: 236,
                width_real_px: 500,
                height_real_px: 600,
              },
            },
          ],
          mockups: [],
        },
      ],
    }
    console.log('>>> api products:', apiProducts)

    // Sử dụng ProductAdapter để convert
    const clientProducts = ProductAdapter.toClientProducts(apiProducts.data as any)
    clientProducts.sort((a, b) => a.slug.localeCompare(b.slug))
    return clientProducts
  }

  /**
   * Main method - fetch from API with cache support
   */
  async fetchProductsByPage(page: number, limit: number): Promise<TBaseProduct[]> {
    return apiCache.withCache(
      CACHE_KEYS.PRODUCTS(page, limit),
      () => this.fetchProducts(page, limit),
      PRODUCT_CACHE_TTL
    )
  }

  async preSendMockupImage(image: Blob, filename: string): Promise<TPreSentMockupImageRes> {
    console.log('>>> image:', { image, filename })
    const formData = new FormData()
    formData.append('file', image, filename)
    const response = await postPreSendMockupImage(formData)
    console.log('>>> res:', response)
    if (!response.success || !response.data?.data) {
      throw new Error(response.error || 'Không thể gửi mockup image đến server')
    }
    return response.data.data
  }
}

export const productService = new ProductService()
