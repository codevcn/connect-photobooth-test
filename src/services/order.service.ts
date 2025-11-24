import { postCreateOrder } from './api/order.api'
import { TOrderResponse } from '@/utils/types/api'
import { TPaymentProductItem, TShippingInfo } from '@/utils/types/global'
import { OrderAdapter } from './adapter/order.adapter'

class OrderService {
  /**
   * Create order - Convert cart items to API format and submit
   */
  async createOrder(
    cartItems: TPaymentProductItem[],
    shippingInfo: TShippingInfo,
    voucherCode?: string
  ): Promise<TOrderResponse> {
    // Sử dụng OrderAdapter để convert sang API format
    const requestBody = OrderAdapter.toCreateOrderRequestPayload(
      cartItems,
      shippingInfo,
      import.meta.env.VITE_STORE_CODE,
      voucherCode
    )

    const response = await postCreateOrder(requestBody)

    if (!response.success || !response.data?.data) {
      throw new Error(response.error || 'Không thể tạo đơn hàng')
    }

    return response.data.data
  }
}

export const orderService = new OrderService()
