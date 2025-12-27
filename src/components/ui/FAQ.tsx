import { useState } from 'react'

type TFAQItem = {
  id: string
  question: string
  answer: string
}

const faqItems: TFAQItem[] = [
  // CHỦ ĐỀ 1: SẢN PHẨM & CHẤT LƯỢNG
  {
    id: 'faq-1',
    question: 'In hình lên áo/cốc có bị phai màu khi giặt không?',
    answer:
      'Công nghệ in của chúng tôi đảm bảo độ bền màu cao. Với áo thun, bạn có thể giặt máy bình thường (lộn trái áo). Với cốc, hình in bền vĩnh viễn trong điều kiện sử dụng thông thường.',
  },
  {
    id: 'faq-2',
    question: 'Tại sao hình in ra nhìn không nét căng hoặc sáng như trên điện thoại tôi hay xem?',
    answer:
      'Do màn hình phát sáng (hệ màu RGB) còn mực in là phản quang (hệ màu CMYK) và in lên chất liệu thấm hút mực (vải/gốm) nên màu sắc sẽ có độ chênh lệch nhẹ (trầm hơn một chút) nhưng vẫn đảm bảo tinh thần thẩm mỹ.',
  },
  {
    id: 'faq-3',
    question: 'Tôi có được xem mẫu trước (Preview) không?',
    answer:
      'Bạn có thể xem bản mô phỏng (Mockup) trực tiếp trên website ngay khi thiết kế. Sản phẩm thật sẽ giống khoảng 90-95% so với bản mockup này.',
  },
  // CHỦ ĐỀ 2: GIAO NHẬN & THỜI GIAN
  {
    id: 'faq-4',
    question: 'Bao lâu tôi nhận được hàng?',
    answer:
      'Vì là hàng đặt làm riêng, tổng thời gian = Sản xuất (2-4 ngày) + Vận chuyển (3-4 ngày). Trung bình bạn sẽ nhận được sau 5-8 ngày tùy khu vực.',
  },
  {
    id: 'faq-5',
    question: 'Tôi có thể đến Photobooth lấy hàng trực tiếp để đỡ tiền ship không?',
    answer:
      'Hiện tại sản phẩm được vận chuyển trực tiếp từ xưởng in đến địa chỉ nhà bạn để đảm bảo tốc độ nhanh nhất, nên chưa hỗ trợ nhận tại quầy Photobooth.',
  },
  // CHỦ ĐỀ 3: ĐỔI TRẢ & SỰ CỐ
  {
    id: 'faq-6',
    question: 'Tôi đặt nhầm size áo/dòng điện thoại, có đổi được không?',
    answer:
      'Rất tiếc, vì sản phẩm đã in hình riêng của bạn nên chúng tôi không thể bán lại cho người khác. Vui lòng kiểm tra kỹ bảng size trước khi đặt. Chúng tôi chỉ hỗ trợ đổi mới nếu lỗi do nhà sản xuất (gửi sai size, rách, vỡ).',
  },
  {
    id: 'faq-7',
    question: 'Hàng bị vỡ/hỏng khi nhận thì làm sao?',
    answer:
      'Bạn vui lòng quay video khi mở hàng. Nếu hàng bị vỡ/hỏng, hãy gửi video qua Zalo CSKH, chúng tôi sẽ gửi lại sản phẩm mới hoàn toàn miễn phí ngay lập tức (không cần gửi trả hàng cũ).',
  },
  // CHỦ ĐỀ 4: QUY ĐỊNH ĐẶT HÀNG & THANH TOÁN
  {
    id: 'faq-8',
    question: 'Tôi có thể tải ảnh có sẵn trong điện thoại hoặc lấy ảnh chụp lần trước để in không?',
    answer:
      'Dạ không ạ. Hiện tại hệ thống Merchandise không hỗ trợ in ảnh có sẵn trong điện thoại. Tuy nhiên, ảnh bạn đã chụp tại photobooth sẽ được lưu trữ trong 5 ngày trên máy chủ của nền tảng cung cấp dịch vụ photobooth. Trong thời gian này, bạn có thể dùng lại ảnh đã chụp trước đó để in. Sau 5 ngày, ảnh sẽ được hệ thống tự động xoá và không thể in lại nữa.',
  },
  {
    id: 'faq-9',
    question: 'Tôi nhận hàng rồi thanh toán (COD) được không?',
    answer:
      'Rất tiếc là không. Vì đây là sản phẩm được cá nhân hóa (in hình riêng của bạn), nếu bạn không nhận hàng thì chúng tôi không thể bán lại cho người khác. Do đó, bạn vui lòng thanh toán trước 100% qua mã QR (Momo/ZaloPay/Ngân hàng) để đơn hàng được xác nhận sản xuất nhé.',
  },
  // CHỦ ĐỀ 5: CHỈNH SỬA & HỦY ĐƠN
  {
    id: 'faq-10',
    question: 'Đặt hàng xong tôi muốn sửa lại (đổi ảnh, sửa địa chỉ) hoặc hủy đơn được không?',
    answer:
      'Trong vòng 15 phút sau khi đặt: Bạn có thể liên hệ ngay Zalo CSKH để được hỗ trợ hủy hoặc chỉnh sửa thông tin miễn phí.\n\nSau 15 phút: Hệ thống sẽ tự động chuyển lệnh in xuống xưởng để đảm bảo tiến độ. Lúc này, bạn vui lòng liên hệ CSKH để kiểm tra và xử lý việc sửa/hủy đơn cho bạn. Nếu xưởng chưa in: Chúng tôi sẽ hỗ trợ sửa/hủy. Nếu xưởng đã tiến hành in: Rất tiếc đơn hàng không thể thay đổi hay hoàn tiền.\n\nNgoại giờ làm việc (Ban đêm): Quý khách vui lòng để lại tin nhắn Zalo. Đầu ca sáng hôm sau, CSKH sẽ liên hệ trực tiếp với xưởng để kiểm tra và xử lý việc sửa/hủy đơn cho bạn.',
  },
]

export const FAQContent = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  return (
    <div className="px-2 py-2 space-y-2">
      {faqItems.map((faq) => (
        <div key={faq.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-start gap-3 flex-1">
              <span className="text-main-cl font-bold text-sm shrink-0">Q.</span>
              <span className="5xl:text-[1em] text-sm font-semibold text-gray-800 leading-relaxed">
                {faq.question}
              </span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className={`w-5 h-5 text-gray-600 transition-transform shrink-0 ml-2 ${
                expandedFAQ === faq.id ? 'rotate-180' : ''
              }`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {expandedFAQ === faq.id && (
            <div className="px-4 pb-4 border-t border-gray-100">
              <div className="flex items-start gap-3 pt-3">
                <span className="text-main-cl font-bold text-sm shrink-0">A.</span>
                <p className="5xl:text-[1em] text-sm text-gray-700 leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
