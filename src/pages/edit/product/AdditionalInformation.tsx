import { useState } from 'react'

type TTabType = 'description' | 'shipping' | 'personalization'

type TAdditionalInformationProps = {
  productDescription?: string
  shippingInfo?: string
}

export const AdditionalInformation = ({ productDescription }: TAdditionalInformationProps) => {
  const [activeTab, setActiveTab] = useState<TTabType>()
  const shippingInfo = `<section style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <!-- 1 -->
  <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">1. Thời gian xử lý &amp; Giao nhận</h3>
  <p>
    Vì sản phẩm được in ấn/gia công riêng ngay sau khi xác nhận đơn đặt hàng (Made-to-order),
    để đảm bảo chất lượng tốt nhất, quy trình xử lý như sau:
  </p>

  <ol style="padding-left: 20px; margin-top: 10px;">
    <li><b>Thời gian sản xuất:</b> 2 - 3 ngày làm việc.</li>
    <li>
      <b>Thời gian vận chuyển:</b>
      <ul style="padding-left: 18px; margin-top: 6px; list-style: circle;">
        <li><b>Hà Nội &amp; TP.HCM:</b> 2 - 4 ngày.</li>
        <li><b>Các tỉnh thành khác:</b> 4 - 6 ngày.</li>
      </ul>
    </li>
  </ol>

  <p style="font-style: italic; color: #d97706; margin-top: 8px;">
    <b>Lưu ý:</b> Thời gian có thể thay đổi nhẹ vào các dịp Lễ/Tết hoặc điều kiện thời tiết bất khả kháng.
  </p>

  <hr style="margin: 20px 0;">

  <!-- 2 -->
  <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">2. Cam kết Bảo hành &amp; Đổi trả</h3>
  <p>
    Chúng tôi cam kết <b>ĐỔI MỚI 100%</b> hoặc <b>HOÀN TIỀN</b> trong vòng
    <b>07 ngày</b> nếu sản phẩm gặp các vấn đề:
  </p>

  <ul style="padding-left: 20px; margin-top: 10px; list-style: disc;">
    <li><b>Lỗi sản xuất:</b> Hình in bong tróc, sai màu sắc, sai thiết kế, lỗi chất liệu.</li>
    <li><b>Lỗi vận chuyển:</b> Sản phẩm bị vỡ, bể, móp méo khi đến tay khách hàng.</li>
    <li><b>Sai sót đóng gói:</b> Giao sai size, sai dòng máy, sai màu so với đơn đặt.</li>
  </ul>

  <p style="color: #dc2626; font-weight: bold; margin-top: 12px;">
    ⛔ Các trường hợp không hỗ trợ đổi trả:
  </p>

  <ul style="padding-left: 20px; list-style: disc;">
    <li>Sản phẩm không có lỗi từ phía nhà sản xuất.</li>
    <li>Khách hàng đặt nhầm size, nhầm dòng điện thoại hoặc thay đổi nhu cầu sử dụng.</li>
  </ul>

  <p style="font-style: italic; color: #d97706; margin-top: 8px;">
    <b>Lưu ý:</b> Vì là sản phẩm in ấn theo yêu cầu riêng, chúng tôi không thể hỗ trợ đổi trả nếu lỗi xuất phát từ việc chọn sai thông tin đặt hàng.
  </p>

  <hr style="margin: 20px 0;">

  <!-- 3 -->
  <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">3. Quy định quan trọng khi nhận hàng</h3>
  <p>
    Để đảm bảo quyền lợi tuyệt đối, Quý khách vui lòng <b>QUAY VIDEO MỞ HỘP (UNBOXING)</b>
    (video liền mạch, không cắt ghép) để làm cơ sở đối chiếu.
  </p>

  <ul style="padding-left: 20px; margin-top: 10px; list-style: disc;">
    <li>
      Hệ thống <b>chỉ tiếp nhận khiếu nại khi có video quay lại quá trình mở kiện hàng</b>,
      đặc biệt với sản phẩm dễ vỡ như Ly sứ, Khung ảnh, Ốp lưng kính.
    </li>
    <li>
      Chúng tôi xin phép từ chối giải quyết các trường hợp báo lỗi/vỡ/thiếu hàng
      nếu không có video chứng thực.
    </li>
  </ul>
</section>
`

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
          className="w-full group flex items-center mobile-touch justify-between p-4 cursor-pointer hover:bg-white border-border rounded-md border-b border-transparent"
          onClick={() => handlePickTab('description')}
        >
          <div className="flex items-center gap-4">
            <div className="text-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className=" w-6 h-6 5xl:w-8 5xl:h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                />
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
          <div className="5xl:text-[1em] px-2 py-4 text-sm text-black/80">
            {productDescription ? (
              <div dangerouslySetInnerHTML={{ __html: productDescription }}></div>
            ) : (
              'Sản phẩm chưa có mô tả'
            )}
          </div>
        )}
      </div>

      <div className="w-full">
        <div
          onClick={() => handlePickTab('shipping')}
          className="group flex items-center justify-between p-4 cursor-pointer hover:bg-white border-border rounded-md transition-colors border-b border-transparent"
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
              className="w-6 h-6 5xl:w-8 5xl:h-8"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </div>
        <div>
          {activeTab === 'shipping' && (
            <div
              dangerouslySetInnerHTML={{ __html: shippingInfo }}
              className="5xl:text-[1em] px-2 py-2 text-sm text-black/80"
            ></div>
          )}
        </div>
      </div>

      <div className="smd:order-3 order-4 smd:p-3 p-2 bg-white rounded-lg space-y-2 mt-2">
        <div className="5xl:text-[0.8em] text-sm flex items-center justify-between gap-2">
          <span className="text-gray-800 font-bold">Chăm sóc khách hàng</span>
          <span className="font-semibold text-main-cl text-end whitespace-nowrap">
            090 136 6095
          </span>
        </div>
      </div>

      <div className="5xl:hidden smd:order-4 border border-red-300 bg-red-50 block text-center text-xs text-gray-600 order-5 smd:p-3 p-2 rounded-lg space-y-2 mt-2">
        <span className="font-bold">Lưu ý: </span>
        <span> Dịch vụ này được cung cấp và chịu trách nhiệm bởi </span>
        <span className="font-extrabold -tracking-[1px] mt-1 leading-tight text-main-cl">
          Công ty Encycom
        </span>
        <span> trên nền tảng ứng dụng chụp ảnh của</span>
        <span className=" font-bold whitespace-nowrap text-black"> Fun Studio</span>
        <span>. Bạn nhớ đọc kỹ điều khoản dịch vụ nhé.</span>
      </div>
    </div>
  )
}
