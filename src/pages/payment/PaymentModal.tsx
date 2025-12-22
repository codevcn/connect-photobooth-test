import { orderService } from '@/services/order.service'
import { createCommonConstants } from '@/utils/contants'
import { capitalizeFirstLetter, isValidEmail, isValidPhoneNumber } from '@/utils/helpers'
import { TEndOfPaymentData, TPaymentProductItem, TPaymentType } from '@/utils/types/global'
import { useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { PaymentMethodSelector } from './PaymentMethod'
import { ShippingInfoForm, TFormErrors } from './ShippingInfo'
import { LocalStorageHelper } from '@/utils/localstorage'
import { SectionLoading } from '@/components/custom/Loading'
import { EndOfPayment } from './EndOfPayment'
import { appLogger } from '@/logging/Logger'
import { EAppFeature, EAppPage } from '@/utils/enums'

type TShippingInfo = {
  name: string
  phone: string
  email?: string
  province: string
  city: string
  ward: string
  address: string
  message?: string
}

type TPaymentModalProps = {
  paymentInfo: {
    total: number
  }
  onHideShow: (show: boolean) => void
  voucherCode?: string
  cartItems: TPaymentProductItem[]
}

export const PaymentModal = ({ onHideShow, voucherCode, cartItems }: TPaymentModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<TPaymentType>('bank-transfer')
  const [confirming, setConfirming] = useState<boolean>(false)
  const [confirmingMessage, setConfirmingMessage] = useState<string>('Đang xử lý...')
  const [endOfPayment, setEndOfPayment] = useState<TEndOfPaymentData>()
  const formRef = useRef<HTMLFormElement>(null)
  const [errors, setErrors] = useState<TFormErrors>({})

  const validateForm = (formEle: HTMLFormElement): TShippingInfo | null => {
    const formData = new FormData(formEle)
    const shippingInfo: TShippingInfo = {
      name: formData.get('fullName')?.toString().trim() || '',
      phone: formData.get('phone')?.toString().trim() || '',
      email: formData.get('email')?.toString().trim() || '',
      province: formData.get('province')?.toString().trim() || '',
      city: formData.get('city')?.toString().trim() || '',
      ward: formData.get('ward')?.toString().trim() || '',
      address: formData.get('address')?.toString().trim() || '',
      message: formData.get('message')?.toString().trim(),
    }
    const { name, phone, email, province, city, ward, address } = shippingInfo
    setErrors({})
    if (!name || !phone || !province || !city || !ward || !address) {
      setErrors({
        fullName: name ? undefined : 'Họ và tên là bắt buộc',
        phone: phone ? undefined : 'Số điện thoại là bắt buộc',
        province: province ? undefined : 'Tỉnh/Thành phố không hợp lệ',
        city: city ? undefined : 'Quận/Huyện không hợp lệ',
        ward: ward ? undefined : 'Phường/Xã không hợp lệ',
        address: address ? undefined : 'Địa chỉ không hợp lệ',
      })
      return null
    }
    if (phone && !isValidPhoneNumber(phone)) {
      setErrors((pre) => ({
        ...pre,
        phone: 'Số điện thoại không hợp lệ',
      }))
      return null
    }
    if (email && !isValidEmail(email)) {
      setErrors((pre) => ({
        ...pre,
        email: 'Email không hợp lệ',
      }))
      return null
    }
    return shippingInfo
  }

  const resetEndOfPaymentData = () => {
    setEndOfPayment(undefined)
  }

  const processPayment = async () => {
    appLogger.logInfo(
      'User initiated payment processing',
      EAppPage.PAYMENT,
      EAppFeature.PAYMENT_PROCESS
    )

    const form = formRef.current
    if (!form) return

    const shippingInfo = validateForm(form)
    if (!shippingInfo) return

    setConfirming(true)
    // Step 1: Create order
    setConfirmingMessage('Đang tạo đơn hàng...')

    const productsInCart = LocalStorageHelper.getSavedMockupData()?.productsInCart || []
    if (productsInCart.length === 0) {
      toast.error('Giỏ hàng của bạn đang trống')
      setConfirming(false)
      return
    }
    try {
      const orderResponse = await orderService.createOrder(
        productsInCart,
        shippingInfo,
        voucherCode
      )

      const { order, payment_instructions } = orderResponse

      toast.success('Đơn hàng đã được tạo')

      // Extract payment details from order
      const paymentDetails = {
        subtotal: parseFloat(order.subtotal_amount),
        shipping: parseFloat(order.shipping_amount),
        discount: parseFloat(order.discount_amount),
        total: parseFloat(order.total_amount),
        voucherCode: voucherCode,
      }

      // Step 2: Handle payment based on method
      if (
        paymentMethod === 'momo' ||
        paymentMethod === 'zalopay' ||
        paymentMethod === 'bank-transfer'
      ) {
        // Use payment instructions from order response
        if (payment_instructions && payment_instructions.length > 0) {
          const paymentInstruction = payment_instructions[0]

          setEndOfPayment({
            countdownInSeconds: createCommonConstants<number>('FIXED_COUNTDOWN_PAYMENT_SECONDS'), // 15 minutes default
            QRCode: paymentInstruction.qr_code,
            paymentMethod: {
              method: paymentMethod,
              title:
                paymentMethod === 'bank-transfer'
                  ? 'Chuyển khoản ngân hàng'
                  : capitalizeFirstLetter(paymentMethod),
            },
            orderHashCode: order.hash_code,
            paymentDetails,
          })
        } else {
          appLogger.logError(
            new Error('No payment instructions received from server'),
            'No payment instructions received from server',
            EAppPage.PAYMENT,
            EAppFeature.PAYMENT_PROCESS
          )
          throw new Error('Không nhận được thông tin thanh toán từ server')
        }
      } else {
        // COD: No QR needed, just show success
        setEndOfPayment({
          countdownInSeconds: 0,
          QRCode: '',
          paymentMethod: {
            method: paymentMethod,
            title: capitalizeFirstLetter(paymentMethod),
          },
          orderHashCode: order.hash_code,
          paymentDetails,
        })
      }
    } catch (error) {
      console.error('>>> Payment error:', error)
      appLogger.logError(
        error instanceof Error
          ? error
          : typeof error === 'string'
          ? new Error(error)
          : new Error('Unknown error'),
        'Error occurred during payment processing',
        EAppPage.PAYMENT,
        EAppFeature.PAYMENT_PROCESS
      )
      toast.error('Có lỗi xảy ra khi xử lý thanh toán')
    } finally {
      setConfirming(false)
    }
  }

  const handleHideShowModal = (show: boolean) => {
    if (!show) {
      const virtualKeyboardWrapper = document.body.querySelector<HTMLElement>(
        '.NAME-virtual-keyboard-wrapper'
      )
      if (virtualKeyboardWrapper) {
        if (virtualKeyboardWrapper.getAttribute('data-virtual-keyboard-shown') === 'false') {
          onHideShow(false)
        }
      } else {
        onHideShow(false)
      }
    }
  }

  return (
    <div className="5xl:text-[1em] md:px-4 px-2 py-4 fixed inset-0 flex items-center justify-center z-50 animate-pop-in">
      <div
        onClick={() => handleHideShowModal(false)}
        className="bg-black/50 absolute inset-0 z-10"
      ></div>
      <div className="5xl:max-h-[90dvh] max-h-[90dvh] flex flex-col pt-8 bg-white rounded-2xl z-20 overflow-hidden relative shadow-2xl w-fit max-w-[98vw] animate-in slide-in-from-bottom duration-200">
        {confirming && (
          <div className="absolute flex justify-center items-center w-full h-full top-0 text-white left-0 bg-black/50 z-30">
            <SectionLoading
              message={confirmingMessage}
              classNames={{
                container: 'text-white',
                message: 'text-white',
                shapesContainer: 'text-white',
              }}
            />
          </div>
        )}

        {/* Modal Header */}
        <div className="px-4 py-2 absolute top-0 left-0 w-full z-20 bg-white border-b border-gray-200 flex items-center justify-between rounded-t-3xl">
          <h2 className="5xl:text-[1em] md:text-xl text-base font-bold text-gray-900">
            Hoàn tất thanh toán
          </h2>
          <button
            onClick={() => onHideShow(false)}
            className="5xl:p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-90"
            aria-label="Đóng hộp thoại"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-x-icon lucide-x text-gray-800 w-6 h-6 5xl:h-10 5xl:w-10"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div
          style={{
            display: endOfPayment ? 'none' : 'block',
          }}
          className="md:px-6 px-4 pb-4 space-y-4 pt-4 relative z-10 overflow-y-auto grow gallery-scroll"
        >
          {/* Shipping Information */}
          <ShippingInfoForm ref={formRef} errors={errors} />

          <div className="my-1 bg-gray-300 w-full h-px"></div>

          {/* Payment Method */}
          <PaymentMethodSelector selectedMethod={paymentMethod} onSelectMethod={setPaymentMethod} />

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={processPayment}
              className="5xl:text-[0.9em] md:text-lg text-base flex items-center justify-center gap-2 w-full h-[45px] bg-main-cl text-white font-bold rounded-lg shadow-lg active:scale-90 transition"
            >
              <span>Xác nhận thanh toán</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-check-icon lucide-check w-6 h-6 5xl:h-9 5xl:w-9"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </button>
            <button
              onClick={() => onHideShow(false)}
              className="5xl:text-[0.9em] md:text-lg text-base w-full h-10 rounded-md bg-gray-200 text-gray-800 font-bold active:scale-90 transition"
            >
              Hủy
            </button>
          </div>
        </div>
        {endOfPayment && (
          <EndOfPayment data={endOfPayment} resetEndOfPaymentData={resetEndOfPaymentData} />
        )}
      </div>
    </div>
  )
}
