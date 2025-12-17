import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { createInitialConstants } from '@/utils/contants'
import {
  checkIfLargeScreen,
  fillQueryStringToURL,
  formatNumberWithCommas,
  formatTime,
} from '@/utils/helpers'
import { TEndOfPaymentData, TPaymentType } from '@/utils/types/global'
import { paymentService } from '@/services/payment.service'
import { TOrderStatusRes } from '@/utils/types/api'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

type TQRCanvasProps = {
  value: string
  size?: number
  onCanvasReady?: (canvas: HTMLCanvasElement) => void
}

const QRCanvas = ({ value, size = 200, onCanvasReady }: TQRCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    QRCode.toCanvas(canvasRef.current, value, { width: size }, (error) => {
      if (error) console.error(error)
      else if (canvasRef.current && onCanvasReady) {
        onCanvasReady(canvasRef.current)
      }
    })
  }, [value, size, onCanvasReady])

  return <canvas ref={canvasRef} width={size} height={size} />
}

const getColorByPaymentMethod = (method: TPaymentType): string => {
  switch (method) {
    case 'momo':
      return createInitialConstants<string>('PAYMENT_MOMO_COLOR')
    case 'zalopay':
      return createInitialConstants<string>('PAYMENT_ZALO_COLOR')
    case 'bank-transfer':
      return createInitialConstants<string>('PAYMENT_BANK_TRANSFER_COLOR')
    default:
      return createInitialConstants<string>('PAYMENT_COD_COLOR')
  }
}

type TPaymentStatus = {
  status: 'pending' | 'completed' | 'failed'
  reason?: string
}

interface EndOfPaymentProps {
  data: TEndOfPaymentData
  resetEndOfPaymentData: () => void
}

export const EndOfPayment: React.FC<EndOfPaymentProps> = ({ data, resetEndOfPaymentData }) => {
  const {
    countdownInSeconds,
    QRCode,
    paymentMethod,
    orderHashCode,
    paymentDetails,
    bankTransferInfo,
  } = data
  const { method, title } = paymentMethod
  const { subtotal, shipping, discount, total, voucherCode } = paymentDetails
  const colorByPaymentMethod = getColorByPaymentMethod(method)
  const containerRef = useRef<HTMLDivElement>(null)
  const [paymentStatus, setPaymentStatus] = useState<TPaymentStatus>({ status: 'pending' })
  const { status, reason } = paymentStatus
  const [transactionCode, setTransactionCode] = useState<string>('')
  const [qrCanvas, setQrCanvas] = useState<HTMLCanvasElement | null>(null)
  const navigate = useNavigate()

  const countdownHandler = () => {
    if (!containerRef.current) return

    const countdownEl = containerRef.current.querySelector<HTMLElement>('.NAME-countdown')
    if (!countdownEl) return

    let remaining = countdownInSeconds
    countdownEl.textContent = formatTime(remaining)

    const interval = setInterval(() => {
      remaining -= 1

      if (remaining <= 0) {
        countdownEl.textContent = '00:00'
        clearInterval(interval)
        return
      }

      countdownEl.textContent = formatTime(remaining)
    }, 1000)

    return () => clearInterval(interval)
  }

  const backToEditPage = () => {
    navigate(`/edit${fillQueryStringToURL()}`)
  }

  const handlePaymentStatusUpdate = (statusData: TOrderStatusRes) => {
    if (statusData.is_paid) {
      setPaymentStatus({ status: 'completed' })
      setTransactionCode(statusData.id.toString())
    } else if (statusData.status === 'cancelled') {
      setPaymentStatus({
        status: 'failed',
        reason: 'Đơn hàng đã bị hủy',
      })
    }
  }

  const handlePaymentStatusError = (error: Error) => {
    console.error('>>> Payment status error:', error)
    // toast.error('Có lỗi xảy ra khi kiểm tra trạng thái thanh toán')
    // Optionally show error to user or retry
  }

  const downloadQRCode = () => {
    if (!qrCanvas) {
      toast.error('QR code chưa sẵn sàng để tải xuống')
      return
    }

    try {
      qrCanvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Không thể tạo file ảnh QR code')
          return
        }

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `payment-qr-${orderHashCode || 'code'}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.success('Đã tải QR code thành công!')
      })
    } catch (error) {
      console.error('Error downloading QR code:', error)
      toast.error('Có lỗi xảy ra khi tải QR code')
    }
  }

  useEffect(() => {
    return countdownHandler()
  }, [countdownInSeconds])

  // Start payment status polling for online payment methods
  useEffect(() => {
    if (
      (method === 'momo' || method === 'zalopay' || method === 'bank-transfer') &&
      orderHashCode
    ) {
      const stopPolling = paymentService.startPaymentStatusPolling(
        orderHashCode,
        handlePaymentStatusUpdate,
        handlePaymentStatusError
      )

      // Cleanup: stop polling when component unmounts
      return () => {
        stopPolling()
      }
    }
  }, [method, orderHashCode])

  return (
    <div
      ref={containerRef}
      className="5xl:text-xxl text-[16px] flex flex-col items-center px-2 py-2 overflow-y-auto gallery-scroll max-h-[calc(95vh-80px)]"
    >
      <div className="relative bg-white rounded-xl shadow flex flex-col items-center w-full p-3 border border-gray-200 max-w-5xl">
        {method === 'momo' || method === 'zalopay' || method === 'bank-transfer' ? (
          status === 'completed' ? (
            <div className="flex flex-col items-center py-3 px-3 w-full">
              <div className="flex justify-center items-center h-20 w-20 rounded-full bg-green-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-check-icon lucide-check text-white"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <div className="5xl:pt-4 text-gray-800 mt-3 w-full text-center">
                <p className="text-[1em]">
                  <span>Đã hoàn tất thanh toán với </span>
                  <span className="font-bold" style={{ color: colorByPaymentMethod }}>
                    {title}
                  </span>
                </p>
                <p>Cám ơn bạn đã sử dụng dịch vụ!</p>
                {/* {transactionCode && (
                  <p className="p-1 rounded-md bg-light-main-cl mt-1">
                    Mã giao dịch của bạn là <span className="font-bold">{transactionCode}</span>
                  </p>
                )} */}
                {orderHashCode && (
                  <p className="p-1 rounded-md bg-superlight-main-cl mt-1">
                    Mã đơn hàng: <span className="font-bold">{orderHashCode}</span>
                  </p>
                )}
              </div>
            </div>
          ) : status === 'failed' ? (
            <div className="flex flex-col items-center py-3 px-3 w-full">
              <div className="flex justify-center items-center h-20 w-20 rounded-full bg-red-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-x-icon lucide-x text-white"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </div>
              <div className="text-red-600 mt-3 w-full text-center">
                <p>
                  <span>Thanh toán không thành công với </span>
                  <span className="font-bold" style={{ color: colorByPaymentMethod }}>
                    {title}
                  </span>
                </p>
                {reason && (
                  <p>
                    Lý do: <span>{reason}</span>.
                  </p>
                )}
              </div>
            </div>
          ) : (
            // Momo/Zalo/Bank Transfer UI
            <div className="w-full">
              {/* Header */}
              <div className="5xl:pt-8 mb-3 pb-2 border-b border-gray-200">
                {/* <h3 className="5xl:text-2xl text-lg font-bold text-gray-800">Thông tin thanh toán</h3> */}
                <p className="5xl:text-xl text-sm text-gray-500 mt-0.5">
                  <span>Quét mã QR để thanh toán với </span>
                  <span className="font-bold" style={{ color: colorByPaymentMethod }}>
                    {title}
                  </span>
                </p>
              </div>

              {/* Main Content: QR + Payment Details */}
              <div className="md:gap-16 5xl:gap-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column: QR Code */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative">
                    <div
                      className="p-3 rounded-lg shadow-lg"
                      style={{ backgroundColor: colorByPaymentMethod }}
                    >
                      <QRCanvas
                        value={QRCode}
                        size={checkIfLargeScreen() ? 250 : 140}
                        onCanvasReady={setQrCanvas}
                      />
                    </div>
                    <button
                      onClick={downloadQRCode}
                      className="5xl:hidden top-1/2 -translate-y-1/2 left-[calc(100%+8px)] absolute p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors active:scale-95"
                      title="Tải QR Code"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-download w-6 h-6"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" x2="12" y1="15" y2="3" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-3 text-center">
                    <p className="5xl:text-lg text-xs text-gray-600 mb-0.5">Mã QR hết hạn sau</p>
                    <div className="flex items-center justify-center gap-2">
                      <p className="5xl:text-2xl text-xl font-bold text-red-600 NAME-countdown">
                        {formatTime(countdownInSeconds)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Payment Details */}
                <div className="5xl:text-xl flex flex-col justify-center">
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    {/* Subtotal */}
                    <div className="flex gap-4 justify-between items-center">
                      <span className="5xl:text-xl text-sm text-gray-600">Tạm tính</span>
                      <span className="5xl:text-xl text-sm font-semibold text-gray-800">
                        {formatNumberWithCommas(subtotal)} VND
                      </span>
                    </div>

                    {/* Shipping */}
                    <div className="flex gap-4 justify-between items-center">
                      <span className="5xl:text-xl text-sm text-gray-600">Phí vận chuyển</span>
                      <span className="5xl:text-xl text-sm font-semibold text-gray-800">
                        {shipping > 0 ? `${formatNumberWithCommas(shipping)} VND` : 'Miễn phí'}
                      </span>
                    </div>

                    {/* Discount */}
                    {discount > 0 && (
                      <div className="flex gap-4 justify-between items-center">
                        <span className="text-sm text-green-600">
                          Giảm giá {voucherCode && `(${voucherCode})`}
                        </span>
                        <span className="text-sm font-semibold text-green-600">
                          -{formatNumberWithCommas(discount)} VND
                        </span>
                      </div>
                    )}

                    <div className="border-t border-gray-300 pt-2 mt-2">
                      {/* Total */}
                      <div className="flex justify-between items-center gap-4">
                        <span className="5xl:text-xl text-base font-bold text-gray-800">
                          Tổng cộng
                        </span>
                        <span className="5xl:text-2xl text-xl font-bold text-red-600">
                          {formatNumberWithCommas(total)} VND
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Code */}
                  {orderHashCode && (
                    <div className="bg-pink-50 border border-pink-200 rounded-lg p-2">
                      <p className="5xl:text-xl text-xs text-gray-600 mb-0.5">Mã đơn hàng</p>
                      <p className="5xl:text-xl font-mono text-sm font-bold text-pink-600">
                        {orderHashCode}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="w-full">
            {/* Header */}
            <div className="mb-3 pb-2 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">Đặt hàng thành công!</h3>
              <p className="text-sm text-gray-500 mt-0.5">Thanh toán khi nhận hàng (COD)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Icon */}
              <div className="flex flex-col items-center justify-center">
                <div className="flex justify-center items-center h-[100px] w-[100px] rounded-full bg-green-50 border-4 border-green-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="50"
                    height="50"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-truck-electric-icon lucide-truck-electric text-green-600"
                  >
                    <path d="M14 19V7a2 2 0 0 0-2-2H9" />
                    <path d="M15 19H9" />
                    <path d="M19 19h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62L18.3 9.38a1 1 0 0 0-.78-.38H14" />
                    <path d="M2 13v5a1 1 0 0 0 1 1h2" />
                    <path d="M4 3 2.15 5.15a.495.495 0 0 0 .35.86h2.15a.47.47 0 0 1 .35.86L3 9.02" />
                    <circle cx="17" cy="19" r="2" />
                    <circle cx="7" cy="19" r="2" />
                  </svg>
                </div>
                <div className="text-center text-gray-800 text-sm font-medium mt-3">
                  <p className="font-bold text-base">Cảm ơn bạn đã đặt hàng!</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Đơn hàng đang được xử lý và sẽ được giao sớm nhất
                  </p>
                </div>
              </div>

              {/* Right: Payment Details */}
              <div className="flex flex-col justify-center">
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 font-medium">Tạm tính</span>
                    <span className="text-sm font-semibold text-gray-800">
                      <span>{formatNumberWithCommas(subtotal)}</span> VND
                    </span>
                  </div>

                  {/* Shipping */}
                  <div className="flex justify-between items-center">
                    <span className="5xl:text-xl text-sm text-gray-600">Phí vận chuyển</span>
                    <span className="5xl:text-xl text-sm font-semibold text-gray-800">
                      {shipping > 0 ? `${formatNumberWithCommas(shipping)} VND` : 'Miễn phí'}
                    </span>
                  </div>

                  {/* Discount */}
                  {discount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-600">
                        Giảm giá {voucherCode && `(${voucherCode})`}
                      </span>
                      <span className="text-sm font-semibold text-green-600">
                        -{formatNumberWithCommas(discount)} VND
                      </span>
                    </div>
                  )}

                  <div className="border-t border-gray-300 pt-2 mt-2">
                    {/* Total */}
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-gray-800">Tổng thanh toán</span>
                      <span className="text-xl font-bold text-red-600">
                        {formatNumberWithCommas(total)} VND
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Code */}
                {orderHashCode && (
                  <div className="bg-pink-50 border border-pink-200 rounded-lg p-2">
                    <p className="text-xs text-gray-600 mb-0.5">Mã đơn hàng</p>
                    <p className="font-mono text-sm font-bold text-pink-600">{orderHashCode}</p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <p className="text-xs text-blue-800">
                    Vui lòng chuẩn bị số tiền
                    <span className="font-bold"> {formatNumberWithCommas(total)} VND</span> khi nhận
                    hàng
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {(method === 'cod' || status === 'completed' || status === 'failed') && (
        <button
          onClick={backToEditPage}
          className="flex items-center gap-1.5 mt-3 text-sm text-main-cl font-bold active:underline"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-arrow-left-icon lucide-arrow-left"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          <span>Quay về trang chỉnh sửa</span>
        </button>
      )}
    </div>
  )
}
