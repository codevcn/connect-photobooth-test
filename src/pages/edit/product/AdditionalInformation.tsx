import { FAQContent } from '@/components/ui/FAQ'
import { TermConditions } from '@/components/ui/TermConditions'
import { useQueryFilter } from '@/hooks/extensions'
import { useState } from 'react'

type TTabType = 'description' | 'shipping' | 'personalization' | 'faq'

type TAdditionalInformationProps = {
  productDescription?: string
  shippingInfo?: string
}

export const AdditionalInformation = ({ productDescription }: TAdditionalInformationProps) => {
  const [activeTab, setActiveTab] = useState<TTabType>()
  const [showTermsModal, setShowTermsModal] = useState(false)
  const queryFilter = useQueryFilter()

  const handlePickTab = (tab: TTabType) => {
    if (tab === activeTab) {
      setActiveTab(undefined)
    } else {
      setActiveTab(tab)
    }
  }

  return (
    <div className="5xl:text-[1.4em] order-4 smd:mt-0 mt-2 flex flex-col gap-1 w-full bg-gray-100 rounded-lg shadow-sm p-2 border-border">
      <div className="w-full">
        <div
          className={`${
            activeTab === 'description' ? 'bg-white' : ''
          } w-full group flex items-center mobile-touch justify-between p-4 cursor-pointer hover:bg-white rounded-md shadow-[0_0_6px_rgba(0,0,0,0.2)]`}
          onClick={() => handlePickTab('description')}
        >
          <div className="flex items-center gap-4">
            <div className="text-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-badge-info-icon lucide-badge-info w-6 h-6 5xl:w-8 5xl:h-8"
              >
                <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                <line x1="12" x2="12" y1="16" y2="12" />
                <line x1="12" x2="12.01" y1="8" y2="8" />
              </svg>
            </div>
            <span className="5xl:text-[1em] text-sm text-gray-700 font-semibold">
              Mô tả sản phẩm
            </span>
          </div>
          <div className="text-gray-600 group-hover:text-gray-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className={`${
                activeTab === 'description' ? 'rotate-90' : ''
              } w-6 h-6 5xl:w-8 5xl:h-8`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </div>
        {activeTab === 'description' && (
          <div className="5xl:text-[1em] bg-white rounded-lg mt-1 px-2 py-4 text-sm text-black/80">
            {productDescription ? (
              <div dangerouslySetInnerHTML={{ __html: productDescription }}></div>
            ) : (
              'Sản phẩm chưa có mô tả'
            )}
          </div>
        )}
      </div>

      <div className={`${activeTab === 'description' ? ' mt-4' : ''} w-full`}>
        <div
          onClick={() => handlePickTab('shipping')}
          className={`${
            activeTab === 'shipping' ? 'bg-white' : ''
          } group mobile-touch flex items-center justify-between p-4 cursor-pointer hover:bg-white rounded-md shadow-[0_0_6px_rgba(0,0,0,0.2)]`}
        >
          <div className="flex gap-4 items-center">
            <div className="text-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6 5xl:w-8 5xl:h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.713"
                />
              </svg>
            </div>
            <span className="5xl:text-[1em] text-sm text-gray-700 font-semibold">
              Vận chuyển & Trả hàng
            </span>
          </div>
          <div className="text-gray-600 group-hover:text-gray-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className={`${activeTab === 'shipping' ? 'rotate-90' : ''} w-6 h-6 5xl:w-8 5xl:h-8`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </div>
        <div>
          {activeTab === 'shipping' && (
            <div className="5xl:text-[1em] bg-white rounded-lg mt-1 px-1 py-1 text-sm space-y-4">
              {/* Section 1: Thời gian xử lý & Giao nhận */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-5 h-5 text-blue-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-base font-bold text-blue-900">
                    Thời gian xử lý &amp; Giao nhận
                  </h3>
                </div>
                <p className="text-gray-700 mb-3 leading-relaxed">
                  Vì sản phẩm được in ấn/gia công riêng ngay sau khi xác nhận đơn đặt hàng{' '}
                  <span className="font-semibold text-blue-700">(Made-to-order)</span>, để đảm bảo
                  chất lượng tốt nhất, quy trình xử lý như sau:
                </p>

                <div className="space-y-3">
                  <div className="bg-white rounded-md p-3 border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-blue-600 text-white text-xs font-bold rounded px-2 py-0.5">
                        Bước 1
                      </span>
                      <span className="font-bold text-gray-800">Thời gian sản xuất</span>
                    </div>
                    <p className="text-gray-700 pl-14">2 - 3 ngày làm việc</p>
                  </div>

                  <div className="bg-white rounded-md p-3 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-600 text-white text-xs font-bold rounded px-2 py-0.5">
                        Bước 2
                      </span>
                      <span className="font-bold text-gray-800">Thời gian vận chuyển</span>
                    </div>
                    <div className="space-y-1.5 pl-14">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                        <span className="font-semibold text-gray-700">Hà Nội &amp; TP.HCM:</span>
                        <span className="text-gray-600">2 - 4 ngày</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                        <span className="font-semibold text-gray-700">Các tỉnh thành khác:</span>
                        <span className="text-gray-600">4 - 6 ngày</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-5 h-5 text-amber-600 mt-0.5 shrink-0"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                  <p className="text-amber-800 text-sm leading-relaxed">
                    <span className="font-bold">Lưu ý:</span> Thời gian có thể thay đổi nhẹ vào các
                    dịp Lễ/Tết hoặc điều kiện thời tiết bất khả kháng.
                  </p>
                </div>
              </div>

              {/* Section 2: Cam kết Bảo hành & Đổi trả */}
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-5 h-5 text-green-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                    />
                  </svg>
                  <h3 className="text-base font-bold text-green-900">
                    Cam kết Bảo hành &amp; Đổi trả
                  </h3>
                </div>

                <div className="bg-white rounded-md p-2 border border-green-200 mb-1">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="bg-green-600 text-white font-bold px-2 py-1.5 rounded-md text-sm">
                      ĐỔI MỚI 100%
                    </span>
                    <span className="text-gray-600 font-medium">hoặc</span>
                    <span className="bg-green-600 text-white font-bold px-2 py-1.5 rounded-md text-sm">
                      HOÀN TIỀN
                    </span>
                  </div>
                  <p className="text-center text-gray-700">
                    trong vòng <span className="font-bold text-green-700 text-base">07 ngày</span>{' '}
                    nếu sản phẩm gặp các vấn đề sau:
                  </p>
                </div>

                <div className="space-y-1 mb-3">
                  <div className="space-y-1">
                    <div className="bg-white rounded-md p-2.5 border border-green-100 flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <div>
                        <span className="font-semibold text-gray-800">Lỗi sản xuất: </span>
                        <span className="text-gray-700">
                          Hình in bong tróc, sai màu sắc, sai thiết kế, lỗi chất liệu
                        </span>
                      </div>
                    </div>
                    <div className="bg-white rounded-md p-2.5 border border-green-100 flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <div>
                        <span className="font-semibold text-gray-800">Lỗi vận chuyển: </span>
                        <span className="text-gray-700">
                          Sản phẩm bị vỡ, bể, móp méo khi đến tay khách hàng
                        </span>
                      </div>
                    </div>
                    <div className="bg-white rounded-md p-2.5 border border-green-100 flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <div>
                        <span className="font-semibold text-gray-800">Sai sót đóng gói: </span>
                        <span className="text-gray-700">
                          Giao sai size, sai dòng máy, sai màu so với đơn đặt
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="font-bold text-red-700 mb-2 flex items-center gap-2">
                    <span className="text-lg">⛔</span>
                    <span>Các trường hợp không hỗ trợ đổi trả:</span>
                  </p>
                  <div className="space-y-1.5 pl-7">
                    <div className="flex items-start gap-2 text-red-700">
                      <span className="mt-1">•</span>
                      <span>Sản phẩm không có lỗi từ phía nhà sản xuất</span>
                    </div>
                    <div className="flex items-start gap-2 text-red-700">
                      <span className="mt-1">•</span>
                      <span>
                        Khách hàng đặt nhầm size, nhầm dòng điện thoại hoặc thay đổi nhu cầu sử dụng
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-5 h-5 text-amber-600 mt-0.5 shrink-0"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                  <p className="text-amber-800 text-sm leading-relaxed">
                    <span className="font-bold">Lưu ý:</span> Vì là sản phẩm in ấn theo yêu cầu
                    riêng, chúng tôi không thể hỗ trợ đổi trả nếu lỗi xuất phát từ việc chọn sai
                    thông tin đặt hàng.
                  </p>
                </div>
              </div>

              {/* Section 3: Quy định quan trọng khi nhận hàng */}
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-5 h-5 text-purple-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 01-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 00-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909M1.5 4.5l1.409 1.409"
                    />
                  </svg>
                  <h3 className="text-base font-bold text-purple-900">
                    Quy định quan trọng khi nhận hàng
                  </h3>
                </div>

                <div className="bg-white rounded-md p-4 border border-purple-200 mb-3">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      className="w-6 h-6 text-purple-600"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                      />
                    </svg>
                    <span className="font-bold text-purple-900 text-base">
                      QUAY VIDEO MỞ HỘP (UNBOXING)
                    </span>
                  </div>
                  <p className="text-center text-gray-700 text-sm">
                    Để đảm bảo quyền lợi tuyệt đối, Quý khách vui lòng QUAY VIDEO MỞ HỘP (UNBOXING)
                    (video liền mạch, không cắt ghép) để làm cơ sở đối chiếu
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="bg-white rounded-md p-3 border border-purple-100 flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      className="w-5 h-5 text-purple-600 mt-0.5 shrink-0"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-gray-700 leading-relaxed">
                      <span>Hệ thống </span>
                      <span className="font-bold text-purple-800">
                        chỉ tiếp nhận khiếu nại khi có video
                      </span>
                      <span>
                        <span> </span>
                        quay lại quá trình mở kiện hàng, đặc biệt với sản phẩm dễ vỡ như Ly sứ,
                        Khung ảnh, Ốp lưng kính.
                      </span>
                    </p>
                  </div>
                  <div className="bg-white rounded-md p-3 border border-purple-100 flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      className="w-5 h-5 text-red-600 mt-0.5 shrink-0"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <p className="text-gray-700 leading-relaxed">
                      <span>
                        Chúng tôi xin phép từ chối giải quyết các trường hợp báo lỗi/vỡ/thiếu hàng
                      </span>
                      <span className="font-bold text-red-600"> nếu không có video chứng thực</span>
                      <span>.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`${activeTab === 'shipping' ? ' mt-4' : ''} w-full`}>
        <div
          onClick={() => handlePickTab('faq')}
          className={`${
            activeTab === 'faq' ? 'bg-white' : ''
          } group mobile-touch flex items-center justify-between p-4 cursor-pointer hover:bg-white rounded-md shadow-[0_0_6px_rgba(0,0,0,0.2)]`}
        >
          <div className="flex gap-4 items-center">
            <div className="text-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-circle-question-mark-icon lucide-circle-question-mark w-6 h-6 5xl:w-8 5xl:h-8"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <path d="M12 17h.01" />
              </svg>
            </div>
            <span className="5xl:text-[1em] text-sm text-gray-700 font-semibold">
              Câu hỏi thường gặp
            </span>
          </div>
          <div className="text-gray-600 group-hover:text-gray-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className={`${activeTab === 'faq' ? 'rotate-90' : ''} w-6 h-6 5xl:w-8 5xl:h-8`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </div>
        {activeTab === 'faq' && <FAQContent />}
      </div>

      <div className="mt-4 p-2 px-4 bg-white rounded-lg border border-blue-300">
        <p className="5xl:text-[1em] text-sm text-gray-700 text-center">
          Bạn có thắc mắc?
          <br />
          <span>Liên hệ CSKH qua </span>
          <span className="font-bold text-main-cl">Hotline: 090 136 6095</span>
        </p>
      </div>

      {(queryFilter.funId || queryFilter.dev) && (
        <>
          <div className="5xl:hidden smd:order-4 d border border-red-300 bg-red-50 block text-center text-sm text-gray-600 order-5 smd:p-3 p-2 rounded-lg space-y-2 mt-2">
            <span className="font-bold">Lưu ý: </span>
            <span> Dịch vụ này được cung cấp và chịu trách nhiệm bởi </span>
            <span className="font-extrabold -tracking-[1px] mt-1 leading-tight text-main-cl">
              Công ty Encycom
            </span>
            <span> trên nền tảng ứng dụng chụp ảnh của</span>
            <span className=" font-bold whitespace-nowrap text-black"> Fun Studio</span>
            <span>
              <span>. Bạn nhớ đọc kỹ </span>
              <span
                className="underline cursor-pointer text-blue-600 font-bold"
                onClick={() => setShowTermsModal(true)}
              >
                điều khoản dịch vụ
              </span>
              <span> nhé.</span>
            </span>
          </div>

          {showTermsModal && <TermConditions closeModal={() => setShowTermsModal(false)} />}
        </>
      )}
    </div>
  )
}
