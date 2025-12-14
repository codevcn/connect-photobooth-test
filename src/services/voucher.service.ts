import { VoucherValidationResult } from '@/utils/types/global'
import { postCheckVoucher } from './api/voucher.api'
import { TCheckVoucherReq } from '@/utils/types/api'

class VoucherService {
  /**
   * Kiểm tra tính hợp lệ của voucher
   * @param code - Mã voucher
   * @param items - Danh sách items trong đơn hàng
   * @param storeCode - Mã cửa hàng
   */
  async checkVoucherValidity(
    code: string,
    items: TCheckVoucherReq['items'],
    storeCode: string
  ): Promise<VoucherValidationResult> {
    const requestData: TCheckVoucherReq = {
      store_code: storeCode,
      items,
      voucher_code: code,
    }

    const response = await postCheckVoucher(requestData)

    if (!response.success || !response.data?.data) {
      return {
        success: false,
        message: response.error || 'Không thể kiểm tra mã giảm giá',
      }
    }

    const voucherData = response.data.data

    // Check if error response
    if ('error' in voucherData) {
      return {
        success: false,
        message: voucherData.error,
      }
    }

    // Success response with voucher data
    const { type, value, total } = voucherData

    let message = ''
    if (type === 'free_shipping') {
      message = `Miễn phí vận chuyển ${this.formatNumber(total)} đ`
    } else if (type === 'percent') {
      message = `Giảm ${value}% - Tổng giảm ${this.formatNumber(total)} đ`
    } else if (type === 'fixed') {
      message = `Giảm ${this.formatNumber(total)} đ`
    }

    return {
      success: true,
      message: `Áp dụng thành công! ${message}`,
      discount: total,
      voucher: {
        code,
        description: message,
        discountType: type === 'percent' ? 'percentage' : 'fixed',
        discountValue: value,
      },
    }
  }

  private formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
}

export const voucherService = new VoucherService()
