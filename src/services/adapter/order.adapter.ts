import { TCreateOrderReq, TOrderResponse, TOrderStatusRes, TOrderStatus } from '@/utils/types/api'
import {
  TPaymentProductItem,
  TShippingInfo,
  TEndOfPaymentData,
  TPaymentType,
} from '@/utils/types/global'

/**
 * OrderAdapter - Chuyển đổi dữ liệu đơn hàng giữa Client và API
 */
export class OrderAdapter {
  /**
   * Convert dữ liệu cart items + shipping info sang TCreateOrderReq (API format)
   */
  static toCreateOrderRequestPayload(
    cartItems: TPaymentProductItem[],
    shippingInfo: TShippingInfo,
    storeCode: string,
    voucherCode?: string
  ): TCreateOrderReq {
    // Validate cart items
    for (const item of cartItems) {
      if (!item.preSentImageLink) {
        throw new Error('Thiếu đường dẫn hình ảnh đã gửi trước cho dữ liệu mockup')
      }
    }

    return {
      store_code: storeCode,
      customer: {
        name: shippingInfo.name,
        email: shippingInfo.email,
        phone: shippingInfo.phone,
      },
      shipping_address: {
        address1: shippingInfo.address,
        city: shippingInfo.city,
        province: shippingInfo.province,
        postcode: '000000',
        country: 'VN',
      },
      items: cartItems.map((item) => ({
        variant_id: item.productVariantId,
        quantity: item.quantity,
        surfaces: [
          {
            surface_id: item.surface.id,
            editor_state_json: item.elementsVisualState,
            file_url: item.preSentImageLink!,
            width_px: item.mockupData.widthPx,
            height_px: item.mockupData.heightPx,
          },
        ],
      })),
      voucher_code: voucherCode,
      note: shippingInfo.message,
    }
  }

  /**
   * Convert TOrderResponse sang TEndOfPaymentData
   */
  static toEndOfPaymentData(
    orderResponse: TOrderResponse,
    countdownInSeconds: number = 300 // 5 phút mặc định
  ): TEndOfPaymentData {
    const paymentInstruction = orderResponse.payment_instructions[0]

    // Xác định payment method
    const paymentMethod = this.detectPaymentMethod(paymentInstruction?.description || '')

    // Tính toán payment details
    const subtotal = parseFloat(orderResponse.order.subtotal_amount)
    const shipping = parseFloat(orderResponse.order.shipping_amount)
    const discount = parseFloat(orderResponse.order.discount_amount)
    const total = parseFloat(orderResponse.order.total_amount)

    return {
      countdownInSeconds,
      QRCode: paymentInstruction?.qr_code || '',
      paymentMethod,
      orderHashCode: orderResponse.order.hash_code,
      paymentDetails: {
        subtotal,
        shipping,
        discount,
        total,
        voucherCode: orderResponse.discounts[0]?.code_snapshot,
      },
    }
  }

  /**
   * Convert TOrderStatusRes sang client format
   */
  static toClientOrderStatus(orderStatus: TOrderStatusRes): {
    id: number
    status: TOrderStatus
    isPaid: boolean
  } {
    return {
      id: orderStatus.id,
      status: orderStatus.status,
      isPaid: orderStatus.is_paid,
    }
  }

  /**
   * Phát hiện payment method từ description
   */
  private static detectPaymentMethod(description: string): {
    method: TPaymentType
    title: string
  } {
    const lowerDesc = description.toLowerCase()

    if (lowerDesc.includes('momo')) {
      return { method: 'momo', title: 'MoMo' }
    } else if (lowerDesc.includes('zalo')) {
      return { method: 'zalo', title: 'ZaloPay' }
    } else {
      return { method: 'cod', title: 'Thanh toán khi nhận hàng' }
    }
  }

  /**
   * Extract order summary từ TOrderResponse
   */
  static extractOrderSummary(orderResponse: TOrderResponse): {
    orderId: number
    hashCode: string
    customerName: string
    status: TOrderStatus
    totalAmount: number
    currency: string
    itemsCount: number
  } {
    return {
      orderId: orderResponse.order.id,
      hashCode: orderResponse.order.hash_code,
      customerName: orderResponse.order.customer_name,
      status: orderResponse.order.status,
      totalAmount: parseFloat(orderResponse.order.total_amount),
      currency: orderResponse.order.currency,
      itemsCount: orderResponse.order.items_count,
    }
  }
}
