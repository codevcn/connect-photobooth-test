import { VoucherValidationResult } from '@/utils/types/global'
import { postCheckVoucher } from './api/voucher.api'
import { TCheckVoucherReq } from '@/utils/types/api'
import { checkQueryString } from '@/utils/helpers'
import { useUserDataStore } from '@/stores/ui/user-data.store'
import { LocalStorageHelper } from '@/utils/localstorage'

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
    console.log('>>> [vou] params:', { code, items, storeCode })
    const checkedQuery = checkQueryString()
    let deviceId: string | null = null
    if (checkedQuery.isPhotoism || checkedQuery.dev) {
      deviceId = useUserDataStore.getState().deviceId
    } else {
      deviceId = LocalStorageHelper.getPtbid()
    }
    if (!deviceId) {
      throw new Error('Thiếu dữ liệu để thực hiện thanh toán')
    }
    // const requestData: TCheckVoucherReq = {
    //   store_code: storeCode,
    //   items,
    //   voucher_code: code,
    // }
    const reqData = {
      device_id: deviceId,
      items,
      voucher_code: code,
    }
    console.log('>>> [vou] reqData:', reqData)

    const response = await postCheckVoucher(reqData)
console.log('>>> [vou] res:', response)
    if (!response.success || !response.data) {
      return {
        success: false,
        message: response.error || 'Không thể kiểm tra mã giảm giá',
      }
    }

    const voucherData = response.data

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
