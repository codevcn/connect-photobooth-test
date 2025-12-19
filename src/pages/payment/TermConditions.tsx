type TTermConditionsProps = {
  closeModal: () => void
}

export const TermConditions = ({ closeModal }: TTermConditionsProps) => {
  return (
    <div
      id="termsModal"
      className="fixed inset-0 z-50"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* <!-- Lớp nền mờ (Backdrop) --> */}
      <div
        className="fixed inset-0 bg-black/50 bg-opacity-75 transition-opacity"
        onClick={closeModal}
      ></div>

      {/* <!-- Nội dung Popup (Căn giữa) --> */}
      <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0 pointer-events-none">
        <div className="relative bg-white rounded-xl shadow-2xl text-left overflow-hidden transform transition-all w-full max-w-4xl flex flex-col max-h-[85vh] pointer-events-auto">
          {/* <!-- HEADER: Tiêu đề và nút đóng --> */}
          <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10 shadow-sm">
            <div>
              <h3 className="text-xl font-bold text-gray-900" id="modal-title">
                ĐIỀU KHOẢN VÀ ĐIỀU KIỆN
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

          {/* <!-- BODY: Nội dung điều khoản (Có thanh cuộn) --> */}
          <div className="px-6 py-6 overflow-y-auto custom-scrollbar grow bg-gray-50 text-gray-700 leading-relaxed">
            {/* Mục 1 */}
            <section className="mb-8 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
              <h4 className="text-lg font-bold text-main-cl mb-4 flex items-center">
                <span className="bg-light-main-cl text-main-cl text-xs font-semibold mr-2 px-2.5 py-0.5 rounded border border-main-hover-cl">
                  1
                </span>
                THÔNG TIN CHỦ SỞ HỮU
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="col-span-1 md:col-span-2">
                  <span className="font-semibold text-gray-900">Đơn vị vận hành:</span> CÔNG TY TNHH
                  ENCYCOM
                </div>
                <div className="col-span-1 md:col-span-2">
                  <span className="font-semibold text-gray-900">Lĩnh vực hoạt động:</span> Dịch vụ
                  in ấn theo yêu cầu (POD - Print on Demand) và giải pháp Photobooth.
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Mã số thuế:</span> 0316725482
                </div>
                {/* <div>
                  <span className="font-semibold text-gray-900">Hotline:</span> [SỐ ĐIỆN THOẠI]
                </div> */}
                <div className="col-span-1 md:col-span-2">
                  <span className="font-semibold text-gray-900">Địa chỉ trụ sở:</span> 436/38 Cách
                  Mạng Tháng Tám, Phường Nhiêu Lộc, Thành phố Hồ Chí Minh, Việt Nam
                </div>
                {/* <div>
                  <span className="font-semibold text-gray-900">Email:</span> [EMAIL HỖ TRỢ]
                </div> */}
                {/* <div>
                  <span className="font-semibold text-gray-900">Đại diện:</span> [TÊN NGƯỜI ĐẠI
                  DIỆN]
                </div> */}
              </div>
            </section>

            {/* <!-- Mục 2: Highlight Quan Trọng --> */}
            <section className="mb-8 bg-superlight-main-cl p-5 rounded-lg border-l-4 border-main-cl shadow-sm">
              <h4 className="text-lg font-bold text-dark-main-cl mb-3 flex items-center">
                <span className="bg-main-hover-cl text-dark-main-cl text-xs font-semibold mr-2 px-2.5 py-0.5 rounded border border-main-cl">
                  2
                </span>
                QUYỀN TRUY CẬP VÀ SỬ DỤNG HÌNH ẢNH (QUAN TRỌNG)
              </h4>
              <p className="text-sm italic text-dark-main-cl mb-3 font-medium">
                Đây là điều khoản đặc thù đối với dịch vụ POD của Encycom mà khách hàng cần lưu ý:
              </p>
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
                    <span className="font-bold">Chấp thuận quyền truy cập:</span> Khi thực hiện thao
                    tác chụp ảnh hoặc tải ảnh lên hệ thống và tiến hành đặt hàng/thanh toán, Khách
                    hàng đồng ý vô điều kiện cho phép Encycom truy cập vào dữ liệu hình ảnh đó.
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
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  <span>
                    <span className="font-bold">Mục đích sử dụng:</span> Encycom được quyền xử lý và
                    in ấn các hình ảnh này lên các sản phẩm vật lý (giấy in ảnh, quà tặng, v.v.)
                    theo đúng đơn đặt hàng của Khách hàng.
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
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  <span>
                    <span className="font-bold">Giới hạn phạm vi:</span> Quyền truy cập này chỉ phục
                    vụ duy nhất cho mục đích hoàn tất đơn hàng của Khách hàng và không bao gồm quyền
                    sở hữu trí tuệ đối với hình ảnh đó.
                  </span>
                </li>
              </ul>
            </section>

            {/* <!-- Mục 3 --> */}
            <section className="mb-6">
              <h4 className="text-lg font-bold text-gray-800 mb-3">
                3. THÔNG TIN HÀNG HÓA VÀ DỊCH VỤ
              </h4>
              <p className="text-sm mb-2">
                Chúng tôi cung cấp dịch vụ chụp và in ảnh lấy liền thông qua hệ thống máy Kiosk tự
                động:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm pl-4 marker:text-main-cl">
                <li>
                  <span className="font-bold">Sản phẩm:</span> Ảnh in vật lý (Photo Prints) trên các
                  chất liệu giấy in nhiệt chất lượng cao và file ảnh kỹ thuật số.
                </li>
                <li>
                  <span className="font-bold">Quy cách:</span> Kích thước và bố cục (layout) tuân
                  theo các mẫu template có sẵn trên phần mềm Photobooth.
                </li>
                <li>
                  <span className="font-bold">Điều kiện sử dụng:</span> Khách hàng tự chịu trách
                  nhiệm về tư thế, biểu cảm và nội dung văn bản (text) chèn thêm vào ảnh.
                </li>
              </ul>
            </section>

            {/* <!-- Mục 4 --> */}
            <section className="mb-6">
              <h4 className="text-lg font-bold text-gray-800 mb-3">4. GIÁ BÁN VÀ THANH TOÁN</h4>
              <ul className="list-disc list-inside space-y-1 text-sm pl-4 marker:text-main-cl">
                <li>
                  <span className="font-bold">Giá niêm yết:</span> Giá dịch vụ hiển thị trên màn
                  hình Kiosk là giá cuối cùng, đã bao gồm chi phí vật tư in ấn.
                </li>
                <li>
                  <span className="font-bold">Thuế:</span> Giá hiển thị [đã bao gồm/chưa bao gồm]
                  thuế GTGT (VAT).
                </li>
                <li>
                  <span className="font-bold">Phương thức thanh toán:</span> Chấp nhận thanh toán
                  qua Mã QR (VietQR, Momo, ZaloPay...) hoặc Thẻ ngân hàng. Hệ thống chỉ thực hiện
                  lệnh in sau khi giao dịch thanh toán được xác nhận thành công.
                </li>
              </ul>
            </section>

            {/* <!-- Mục 5 --> */}
            <section className="mb-6">
              <h4 className="text-lg font-bold text-gray-800 mb-3">
                5. CHÍNH SÁCH QUYỀN RIÊNG TƯ & BẢO MẬT
              </h4>
              <p className="text-sm mb-2">
                Encycom cam kết bảo vệ tuyệt đối quyền riêng tư của Khách hàng với các nguyên tắc
                sau:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm pl-4 marker:text-main-cl">
                <li>
                  <span className="font-bold">Nguyên tắc "Không chia sẻ":</span> Encycom cam kết
                  KHÔNG tự ý chia sẻ, đăng tải công khai (trên Fanpage, Website, Báo chí...) hoặc
                  bán dữ liệu hình ảnh của Khách hàng cho bất kỳ bên thứ ba nào khi chưa có sự đồng
                  ý bằng văn bản hoặc xác nhận điện tử từ Khách hàng.
                </li>
                <li>
                  <span className="font-bold">Lưu trữ tạm thời:</span> Dữ liệu hình ảnh gốc chỉ được
                  lưu trữ trên hệ thống trong thời gian ngắn (ví dụ: 24 giờ - 3 ngày) để phục vụ
                  việc Khách hàng tải file mềm (Digital file). Sau thời gian này, hệ thống sẽ tự
                  động xóa dữ liệu vĩnh viễn để đảm bảo an toàn.
                </li>
                <li>
                  <span className="font-bold">Bảo mật thanh toán:</span> Thông tin thẻ và tài khoản
                  ngân hàng của Khách hàng được xử lý qua cổng thanh toán trung gian uy tín, Encycom
                  không lưu trữ trực tiếp các thông tin nhạy cảm này.
                </li>
              </ul>
            </section>

            {/* <!-- Mục 6 --> */}
            <section className="mb-6">
              <h4 className="text-lg font-bold text-gray-800 mb-3">6. VẬN CHUYỂN VÀ GIAO NHẬN</h4>
              <ul className="list-disc list-inside space-y-1 text-sm pl-4 marker:text-main-cl">
                <li>
                  <span className="font-bold">Tại máy Kiosk:</span> Sản phẩm được in và trả ngay tại
                  khe nhận ảnh của máy trong vòng 30-60 giây sau khi thanh toán.
                </li>
                <li>
                  <span className="font-bold">Bản mềm (Soft copy):</span> Được cung cấp qua mã QR
                  riêng biệt cho từng phiên chụp. Khách hàng có trách nhiệm không chia sẻ mã QR này
                  cho người lạ để tránh lộ lọt hình ảnh.
                </li>
              </ul>
            </section>

            {/* <!-- Mục 7 --> */}
            <section className="mb-6">
              <h4 className="text-lg font-bold text-gray-800 mb-3">7. ĐỔI TRẢ VÀ HOÀN TIỀN</h4>
              <ul className="list-disc list-inside space-y-1 text-sm pl-4 marker:text-main-cl">
                <li>
                  <span className="font-bold">Trường hợp được hỗ trợ:</span> Lỗi kỹ thuật từ phía
                  Encycom (máy in hết giấy, kẹt giấy, mực in bị lỗi màu, hoặc đã trừ tiền nhưng
                  không ra ảnh).
                </li>
                <li>
                  <span className="font-bold">Trường hợp miễn trách:</span> Encycom không chịu trách
                  nhiệm hoàn tiền nếu Khách hàng không ưng ý về thẩm mỹ cá nhân (biểu cảm, cách tạo
                  dáng) hoặc do Khách hàng thao tác sai (chọn nhầm khung, sai chính tả) sau khi đã
                  xác nhận in.
                </li>
              </ul>
            </section>

            {/* <!-- Mục 8 & 9 --> */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section>
                <h4 className="text-lg font-bold text-gray-800 mb-3">8. QUY ĐỊNH VỀ HÀNH VI</h4>
                <ul className="list-disc list-inside space-y-1 text-sm pl-4 marker:text-red-500">
                  <li>
                    Nghiêm cấm sử dụng hệ thống Encycom để in ấn, phát tán các hình ảnh đồi trụy,
                    phản động, vi phạm thuần phong mỹ tục hoặc pháp luật Việt Nam.
                  </li>
                  <li>
                    Khách hàng chịu hoàn toàn trách nhiệm trước pháp luật về nội dung hình ảnh và
                    văn bản do mình tạo ra trên sản phẩm.
                  </li>
                </ul>
              </section>
              <section>
                <h4 className="text-lg font-bold text-gray-800 mb-3">9. GIẢI QUYẾT TRANH CHẤP</h4>
                <p className="text-sm">
                  Mọi khiếu nại liên quan đến dịch vụ sẽ được Encycom tiếp nhận và xử lý trên tinh
                  thần thiện chí. Trong trường hợp không đạt được thỏa thuận, tranh chấp sẽ được
                  giải quyết tại Tòa án có thẩm quyền theo quy định của pháp luật Việt Nam.
                </p>
              </section>
            </div>

            {/* <!-- Lời kết --> */}
            <div className="mt-8 text-center text-xs text-gray-600 border-t pt-4">
              Cập nhật lần cuối: Tháng 10/2025 | Bản quyền © ENCYCOM
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
