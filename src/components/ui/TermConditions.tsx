import { useState } from 'react'

type TTermConditionsProps = {
  closeModal: () => void
}

type TTabType = 'terms' | 'faq'

export const TermConditions = ({ closeModal }: TTermConditionsProps) => {
  const [activeTab, setActiveTab] = useState<TTabType>('terms')

  return (
    <div
      id="termsModal"
      className="fixed inset-0 z-999 animate-pop-in"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 bg-opacity-75 transition-opacity"
        onClick={closeModal}
      ></div>

      {/* Modal Content */}
      <div className="flex justify-center items-center min-h-screen p-4 text-center sm:p-0 pointer-events-none">
        <div className="relative bg-white rounded-xl shadow-2xl text-left overflow-hidden transform transition-all w-full max-w-4xl flex flex-col max-h-[95dvh] pointer-events-auto">
          {/* HEADER */}
          <div className="bg-white px-4 py-2 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-gray-900" id="modal-title">
                ĐIỀU KHOẢN DỊCH VỤ & CHÍNH SÁCH BẢO HÀNH
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Dành cho Dịch vụ Photobooth & Print-on-Demand
              </p>
            </div>
            <button
              onClick={closeModal}
              className="text-gray-600 hover:text-red-500 transition focus:outline-none p-2 rounded-full hover:bg-red-50 group"
            >
              <svg
                className="h-6 w-6 smd:h-8 smd:w-8 5xl:h-10 5xl:w-10 group-hover:rotate-90 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* TABS */}
          <div className="bg-white px-4 border-b border-gray-200">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('terms')}
                className={`px-4 py-3 font-semibold text-sm transition-all ${
                  activeTab === 'terms'
                    ? 'text-main-cl border-b-2 border-main-cl'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Điều khoản dịch vụ
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className={`px-4 py-3 font-semibold text-sm transition-all ${
                  activeTab === 'faq'
                    ? 'text-main-cl border-b-2 border-main-cl'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Câu hỏi thường gặp (FAQ)
              </button>
            </div>
          </div>

          {/* BODY */}
          <div className="px-4 py-4 overflow-y-auto custom-scrollbar grow bg-gray-50 text-gray-700 leading-relaxed">
            {activeTab === 'terms' ? <TermsOfServiceContent /> : <FAQContent />}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// PHẦN 1: ĐIỀU KHOẢN DỊCH VỤ (TERMS OF SERVICE)
// ============================================
const TermsOfServiceContent = () => {
  return (
    <>
      {/* Thông tin công ty */}
      <section className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h4 className="text-lg font-bold text-main-cl mb-4">THÔNG TIN CHỦ SỞ HỮU</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="col-span-1 md:col-span-2">
            <span className="font-semibold text-gray-900">Đơn vị vận hành:</span> CÔNG TY TNHH
            ENCYCOM
          </div>
          <div className="col-span-1 md:col-span-2">
            <span className="font-semibold text-gray-900">Lĩnh vực hoạt động:</span> Dịch vụ in ấn
            theo yêu cầu (POD - Print on Demand) và giải pháp Photobooth.
          </div>
          <div>
            <span className="font-semibold text-gray-900">Mã số thuế:</span> 0316725482
          </div>
          <div className="col-span-1 md:col-span-2">
            <span className="font-semibold text-gray-900">Địa chỉ trụ sở:</span> 436/38 Cách Mạng
            Tháng Tám, Phường Nhiêu Lộc, Thành phố Hồ Chí Minh, Việt Nam
          </div>
        </div>
      </section>

      {/* 1. Đặc thù sản phẩm */}
      <section className="mb-6 bg-superlight-main-cl p-5 rounded-lg border-l-4 border-main-cl shadow-sm">
        <h4 className="text-lg font-bold text-dark-main-cl mb-3">1. ĐẶC THÙ SẢN PHẨM</h4>
        <ul className="space-y-3 text-sm text-gray-800">
          <li className="flex items-start">
            <svg
              className="w-5 h-5 text-main-cl mr-2 mt-0.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
            <span>
              Đây là sản phẩm <span className="font-bold">"Made-to-order"</span> (Sản xuất theo đơn
              đặt hàng) và được cá nhân hóa với hình ảnh riêng của Quý khách.
            </span>
          </li>
          <li className="flex items-start">
            <svg
              className="w-5 h-5 text-red-500 mr-2 mt-0.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
            <span>
              Do đó, đơn hàng <span className="font-bold text-red-600">KHÔNG THỂ HỦY</span> hoặc{' '}
              <span className="font-bold text-red-600">THAY ĐỔI</span> (mẫu mã, size, hình ảnh) sau
              khi hệ thống đã xác nhận thanh toán và gửi lệnh xuống xưởng sản xuất (thường là sau{' '}
              <span className="font-bold">15 phút</span>).
            </span>
          </li>
          <li className="flex items-start">
            <svg
              className="w-5 h-5 text-main-cl mr-2 mt-0.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
            <span>
              Chúng tôi <span className="font-bold">không chấp nhận</span> yêu cầu trả hàng/hoàn
              tiền với lý do chủ quan từ khách hàng (đổi ý, không thích nữa, chọn nhầm size...).
            </span>
          </li>
        </ul>
      </section>

      {/* 2. Miễn trừ về màu sắc */}
      <section className="mb-6 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
        <h4 className="text-lg font-bold text-gray-800 mb-3">
          2. MIỄN TRỪ TRÁCH NHIỆM VỀ MÀU SẮC & CHẤT LƯỢNG ẢNH
        </h4>
        <ul className="space-y-3 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="font-bold text-main-cl mr-2 shrink-0">•</span>
            <span>
              <span className="font-bold">Sai số màu sắc:</span> Màu sắc in ấn thực tế trên vải/gốm
              sứ <span className="font-bold">có thể chênh lệch khoảng 10-15%</span> so với hình ảnh
              hiển thị trên màn hình điện thoại/máy tính (do độ sáng màn hình và công nghệ in khác
              nhau). Đây là sai số kỹ thuật cho phép trong ngành in ấn.
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-bold text-main-cl mr-2 shrink-0">•</span>
            <span>
              <span className="font-bold">Cam kết về độ trung thực:</span> Sản phẩm in ấn sẽ phản
              ánh trung thực chất lượng hình ảnh mà Quý khách đã xem và duyệt (confirm) trên màn
              hình máy chụp. Chúng tôi thực hiện in chính xác theo file hình ảnh được hệ thống ghi
              nhận. Các hiện tượng như: ảnh gốc bị rung, nhòe, thiếu sáng, hoặc biểu cảm chưa ưng
              ý... thuộc về nội dung bức ảnh gốc, không được coi là lỗi kỹ thuật in ấn.
            </span>
          </li>
        </ul>
      </section>

      {/* 3. Chính sách giao hàng */}
      <section className="mb-6 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
        <h4 className="text-lg font-bold text-gray-800 mb-3">3. CHÍNH SÁCH GIAO HÀNG</h4>
        <ul className="space-y-3 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="font-bold text-main-cl mr-2 shrink-0">•</span>
            <span>
              <span className="font-bold">Thời gian giao hàng:</span> Thời gian giao hàng là dự kiến
              (ETA). Trong các trường hợp bất khả kháng (thiên tai, dịch bệnh, vận chuyển quá tải
              dịp Lễ/Tết), thời gian có thể chậm hơn <span className="font-bold">1-3 ngày</span>.
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-bold text-main-cl mr-2 shrink-0">•</span>
            <span>
              Chúng tôi cam kết hỗ trợ tối đa nhưng{' '}
              <span className="font-bold">không chịu trách nhiệm bồi thường</span> cho các thiệt hại
              gián tiếp do giao hàng chậm trễ.
            </span>
          </li>
        </ul>
      </section>

      {/* 4. Quyền riêng tư */}
      <section className="mb-6 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
        <h4 className="text-lg font-bold text-gray-800 mb-3">4. QUYỀN RIÊNG TƯ</h4>
        <ul className="space-y-3 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="font-bold text-main-cl mr-2 shrink-0">•</span>
            <span>
              Bằng việc tải ảnh lên và đặt hàng, Quý khách xác nhận mình có quyền sử dụng hình ảnh
              đó.
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-bold text-main-cl mr-2 shrink-0">•</span>
            <span>
              Chúng tôi cam kết chỉ sử dụng hình ảnh để in ấn đơn hàng và sẽ xóa file gốc sau 30
              ngày.
            </span>
          </li>
        </ul>
      </section>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-gray-600 border-t pt-4">
        Cập nhật lần cuối: Tháng 12/2025 | Bản quyền © ENCYCOM
      </div>
    </>
  )
}

// ============================================
// PHẦN 2: FAQ (CÂU HỎI THƯỜNG GẶP)
// ============================================
const FAQContent = () => {
  return (
    <>
      {/* CHỦ ĐỀ 1: SẢN PHẨM & CHẤT LƯỢNG */}
      <section className="mb-8">
        <h3 className="text-xl font-bold text-main-cl mb-4 pb-2 border-b-2 border-main-cl">
          CHỦ ĐỀ 1: SẢN PHẨM & CHẤT LƯỢNG
        </h3>

        {/* FAQ 1 */}
        <div className="mb-6 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h5 className="font-bold text-gray-900 mb-2 flex items-start">
            <span className="text-main-cl mr-2">Q1.</span>
            In hình lên áo/cốc có bị phai màu khi giặt không?
          </h5>
          <p className="text-sm text-gray-700 pl-6">
            <span className="font-semibold text-main-cl">Trả lời:</span> Công nghệ in của chúng tôi
            đảm bảo độ bền màu cao. Với áo thun, bạn có thể giặt máy bình thường (lộn trái áo). Với
            cốc, hình in bền vĩnh viễn trong điều kiện sử dụng thông thường.
          </p>
        </div>

        {/* FAQ 2 */}
        <div className="mb-6 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h5 className="font-bold text-gray-900 mb-2 flex items-start">
            <span className="text-main-cl mr-2">Q2.</span>
            Tại sao hình in ra nhìn không nét căng hoặc sáng như trên điện thoại tôi hay xem?
          </h5>
          <p className="text-sm text-gray-700 pl-6">
            <span className="font-semibold text-main-cl">Trả lời:</span> Do màn hình phát sáng (hệ
            màu RGB) còn mực in là phản quang (hệ màu CMYK) và in lên chất liệu thấm hút mực
            (vải/gốm) nên màu sắc sẽ có độ chênh lệch nhẹ (trầm hơn một chút) nhưng vẫn đảm bảo tinh
            thần thẩm mỹ.
          </p>
        </div>

        {/* FAQ 3 */}
        <div className="mb-6 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h5 className="font-bold text-gray-900 mb-2 flex items-start">
            <span className="text-main-cl mr-2">Q3.</span>
            Tôi có được xem mẫu trước (Preview) không?
          </h5>
          <p className="text-sm text-gray-700 pl-6">
            <span className="font-semibold text-main-cl">Trả lời:</span> Bạn có thể xem bản mô phỏng
            (Mockup) trực tiếp trên website ngay khi thiết kế. Sản phẩm thật sẽ giống khoảng 90-95%
            so với bản mockup này.
          </p>
        </div>
      </section>

      {/* CHỦ ĐỀ 2: GIAO NHẬN & THỜI GIAN */}
      <section className="mb-8">
        <h3 className="text-xl font-bold text-main-cl mb-4 pb-2 border-b-2 border-main-cl">
          CHỦ ĐỀ 2: GIAO NHẬN & THỜI GIAN
        </h3>

        {/* FAQ 4 */}
        <div className="mb-6 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h5 className="font-bold text-gray-900 mb-2 flex items-start">
            <span className="text-main-cl mr-2">Q4.</span>
            Bao lâu tôi nhận được hàng?
          </h5>
          <p className="text-sm text-gray-700 pl-6">
            <span className="font-semibold text-main-cl">Trả lời:</span> Vì là hàng đặt làm riêng,
            tổng thời gian = Sản xuất (2-4 ngày) + Vận chuyển (3-4 ngày). Trung bình bạn sẽ nhận
            được sau <span className="font-bold">5-8 ngày</span> tùy khu vực.
          </p>
        </div>

        {/* FAQ 5 */}
        <div className="mb-6 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h5 className="font-bold text-gray-900 mb-2 flex items-start">
            <span className="text-main-cl mr-2">Q5.</span>
            Tôi có thể đến Photobooth lấy hàng trực tiếp để đỡ tiền ship không?
          </h5>
          <p className="text-sm text-gray-700 pl-6">
            <span className="font-semibold text-main-cl">Trả lời:</span> Hiện tại sản phẩm được vận
            chuyển trực tiếp từ xưởng in đến địa chỉ nhà bạn để đảm bảo tốc độ nhanh nhất, nên chưa
            hỗ trợ nhận tại quầy Photobooth.
          </p>
        </div>
      </section>

      {/* CHỦ ĐỀ 3: ĐỔI TRẢ & SỰ CỐ */}
      <section className="mb-8">
        <h3 className="text-xl font-bold text-main-cl mb-4 pb-2 border-b-2 border-main-cl">
          CHỦ ĐỀ 3: ĐỔI TRẢ & SỰ CỐ
        </h3>

        {/* FAQ 6 */}
        <div className="mb-6 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h5 className="font-bold text-gray-900 mb-2 flex items-start">
            <span className="text-main-cl mr-2">Q6.</span>
            Tôi đặt nhầm size áo/dòng điện thoại, có đổi được không?
          </h5>
          <p className="text-sm text-gray-700 pl-6">
            <span className="font-semibold text-main-cl">Trả lời:</span> Rất tiếc, vì sản phẩm đã in
            hình riêng của bạn nên chúng tôi không thể bán lại cho người khác. Vui lòng kiểm tra kỹ
            bảng size trước khi đặt.
          </p>
        </div>

        {/* FAQ 7 */}
        <div className="mb-6 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h5 className="font-bold text-gray-900 mb-2 flex items-start">
            <span className="text-main-cl mr-2">Q7.</span>
            Hàng bị vỡ/hỏng khi nhận thì làm sao?
          </h5>
          <p className="text-sm text-gray-700 pl-6">
            <span className="font-semibold text-main-cl">Trả lời:</span> Bạn vui lòng quay video khi
            mở hàng. Nếu hàng bị vỡ/hỏng, hãy gửi video qua Zalo CSKH, chúng tôi sẽ gửi lại sản phẩm
            mới hoàn toàn miễn phí ngay lập tức (không cần gửi trả hàng cũ).
          </p>
        </div>
      </section>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-gray-600 border-t pt-4">
        Bạn còn thắc mắc? Liên hệ CSKH qua Zalo hoặc Hotline để được hỗ trợ nhanh nhất!
      </div>
    </>
  )
}
