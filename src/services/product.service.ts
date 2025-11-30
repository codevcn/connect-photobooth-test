import { TBaseProduct } from '@/utils/types/global'
import { getFetchProductsCatalog, postPreSendMockupImage } from './api/product.api'
import { TPreSentMockupImageRes } from '@/utils/types/api'
import { ProductAdapter } from './adapter/product.adapter'

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

    // Sử dụng ProductAdapter để convert
    const clientProducts = ProductAdapter.toClientProducts(apiProducts)
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
    console.log('>>> [ser] image:', { image, filename })
    const formData = new FormData()
    formData.append('file', image, filename)
    const response = await postPreSendMockupImage(formData)
    console.log('>>> [ser] res:', response)
    if (!response.success || !response.data?.data) {
      throw new Error(response.error || 'Không thể gửi mockup image đến server')
    }
    return response.data.data
  }
}

export const productService = new ProductService()
