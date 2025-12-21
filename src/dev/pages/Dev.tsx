import QRScanner from '@/pages/scan-qr/QRScanner'

const toast = {
  loading: (msg: string, opt?: any) => console.log('Loading:', msg),
  dismiss: (id: any) => console.log('Dismiss toast'),
  success: (msg: string) => alert('Success: ' + msg),
  error: (msg: string) => alert('Error: ' + msg),
}
const useNavigate = () => (path: string) => console.log('Navigating to:', path)
const usePrintedImageStore = (selector: any) => ({
  setPrintedImages: (imgs: any) => console.log('Set images:', imgs),
})
const generateUniqueId = () => Date.now().toString()
const AppNavigator = { navTo: (nav: any, path: string) => console.log('AppNav to', path) }

// --- MOCK QR SCANNER COMPONENT (Giả lập camera để xem UI) ---
const QRScannerV2 = ({ onScanSuccess }: { onScanSuccess: any }) => {
  return (
    <div
      className="w-full h-full relative flex items-center justify-center overflow-hidden cursor-pointer"
      onClick={() =>
        onScanSuccess([{ url: 'https://via.placeholder.com/150', isOriginalImage: true }])
      }
    >
      {/* Giả lập camera feed - Tăng độ rõ nét lên 100% */}
      <img
        src="https://images.unsplash.com/photo-1550948537-130a1ce83314?q=80&w=1000&auto=format&fit=crop"
        className="absolute inset-0 w-full h-full object-cover"
        alt="Camera Feed Mock"
      />

      {/* Scanning effect - Giữ lại tia quét laser mờ để người dùng biết đang hoạt động */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-pink-500/20 to-transparent w-full h-[10%] animate-scan-down"></div>
    </div>
  )
}
// --- END MOCK DEFINITIONS ---

// --- Cấu hình Animation & Style ---
const FloatingStyles = () => (
  <style>{`
    @keyframes float-slow {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-15px) rotate(5deg); }
    }
    @keyframes float-medium {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-10px) rotate(-3deg); }
    }
    @keyframes float-fast {
      0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(3deg); }
    }
    @keyframes scan-down {
      0% { top: -10%; opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { top: 110%; opacity: 0; }
    }
    
    .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
    .animate-float-medium { animation: float-medium 5s ease-in-out infinite; }
    .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
    .animate-scan-down { animation: scan-down 3s linear infinite; }
    
    .glass-panel {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
  `}</style>
)

const ScanQRPageV2 = () => {
  const setPrintedImages = usePrintedImageStore((s: any) => s.setPrintedImages)
  const navigate = useNavigate()

  const handleData = async (imageDataList: any[]) => {
    // Logic xử lý ảnh
    console.log('Processing images...', imageDataList)
    const loadingToast = toast.loading('Đang xử lý ảnh...', { autoClose: false })
    setTimeout(() => {
      toast.dismiss(loadingToast)
      toast.success('Quét thành công! (Demo)')
    }, 1500)
  }

  return (
    // Container chính - Quay lại Gradient Hồng Đỏ tươi sáng
    <div className="relative h-screen w-screen overflow-hidden bg-linear-to-br from-[#9f1239] via-[#e11d48] to-[#f43f5e]">
      <FloatingStyles />

      {/* --- BACKGROUND DECORATION & FLOATING ICONS --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Nền họa tiết nhẹ */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        {/* Blobs màu tạo chiều sâu */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-rose-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        {/* --- 8 ICON SẢN PHẨM TRÔI NỔI --- */}

        {/* 1. Góc Trên Trái (Áo Thun) */}
        <div className="absolute top-[8%] left-[5%] animate-float-slow opacity-80 z-10">
          <div className="glass-panel p-2.5 rounded-2xl transform -rotate-12 hover:scale-110 transition-transform duration-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white drop-shadow-lg"
            >
              <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
            </svg>
          </div>
        </div>

        {/* 2. Góc Trên Phải (Ly Cà Phê) */}
        <div className="absolute top-[8%] right-[5%] animate-float-medium opacity-80 z-10">
          <div className="glass-panel p-2 rounded-full transform rotate-12 hover:scale-110 transition-transform duration-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white drop-shadow-md"
            >
              <path d="M10 2v2" />
              <path d="M14 2v2" />
              <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
              <path d="M6 2v2" />
            </svg>
          </div>
        </div>

        {/* 3. Góc Dưới Trái (Túi Xách) */}
        <div className="absolute bottom-[8%] left-[5%] animate-float-fast opacity-80 z-10">
          <div className="glass-panel p-2.5 rounded-xl transform rotate-6 hover:scale-110 transition-transform duration-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white drop-shadow-lg"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
        </div>

        {/* 4. Góc Dưới Phải (Điện thoại) */}
        <div className="absolute bottom-[8%] right-[5%] animate-float-slow opacity-80 z-10">
          <div className="glass-panel p-2 rounded-2xl transform -rotate-6 hover:scale-110 transition-transform duration-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white drop-shadow-md"
            >
              <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
              <path d="M12 18h.01" />
            </svg>
          </div>
        </div>

        {/* 5. Giữa Cạnh Trái (Hộp Quà) */}
        <div className="absolute top-[50%] left-[2%] transform -translate-y-1/2 animate-float-medium opacity-70 z-0">
          <div className="glass-panel p-2 rounded-xl transform rotate-12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white drop-shadow-md"
            >
              <rect x="3" y="8" width="18" height="4" rx="1" />
              <path d="M12 8v13" />
              <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
              <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
            </svg>
          </div>
        </div>

        {/* 6. Giữa Cạnh Phải - Bên trên Hướng dẫn (Đồng Hồ) */}
        <div className="absolute top-[35%] right-[2%] animate-float-slow opacity-60 z-0">
          <div className="glass-panel p-2 rounded-full transform -rotate-12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white drop-shadow-md"
            >
              <circle cx="12" cy="12" r="6" />
              <polyline points="12 10 12 12 13 13" />
              <path d="m16.13 7.66-.81-4.05a2 2 0 0 0-2-1.61h-2.68a2 2 0 0 0-2 1.61l-.78 4.05" />
              <path d="m7.88 16.36.8 4a2 2 0 0 0 2 1.61h2.72a2 2 0 0 0 2-1.61l.81-4.05" />
            </svg>
          </div>
        </div>

        {/* 7. Giữa Bên Trên - Dưới Header (Tranh Ảnh) */}
        <div className="absolute top-[20%] left-[45%] transform -translate-x-1/2 animate-float-fast opacity-50 z-0">
          <div className="glass-panel p-2 rounded-2xl transform rotate-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white drop-shadow-sm"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
        </div>

        {/* 8. Giữa Bên Dưới - Dưới QR (Chìa Khóa) */}
        <div className="absolute bottom-[20%] left-[45%] transform -translate-x-1/2 animate-float-slow opacity-50 z-0">
          <div className="glass-panel p-2 rounded-xl transform -rotate-12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white drop-shadow-sm"
            >
              <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
              <path d="m21 2-9.6 9.6" />
              <circle cx="7.5" cy="15.5" r="5.5" />
            </svg>
          </div>
        </div>
      </div>

      {/* 1. HEADER (TOP CENTER) */}
      <section className="flex flex-col h-full justify-center items-center gap-4 relative w-full text-center z-20 p-8 pointer-events-none">
        <h1 className="h-12 block text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg uppercase tracking-wide">
          QUÉT MÃ QR
        </h1>
        <p className="h-[42px] text-white/95 text-sm md:text-lg font-light italic bg-white/10 backdrop-blur-md px-6 py-1.5 rounded-full inline-block shadow-sm border border-white/20">
          Biến ảnh photobooth thành sự độc đáo
        </p>
        <QRScanner onScanSuccess={async (res: any) => {}} />
      </section>

      {/* 3. INSTRUCTIONS (RIGHT SIDE - TOP 58%) */}
      <div className="absolute right-3 top-[58%] transform -translate-y-1/2 z-40 flex flex-col gap-4">
        {/* STEP 1 */}
        <div className="flex flex-col items-center justify-center bg-black/40 backdrop-blur-xl p-3 rounded-2xl border border-white/20 shadow-2xl w-[100px] md:w-[130px] transform transition-all hover:scale-105 hover:bg-black/60 group cursor-default">
          <div className="w-10 h-10 rounded-full bg-white text-[#e11d48] flex items-center justify-center font-bold text-lg shadow-inner mb-1.5 group-hover:bg-[#e11d48] group-hover:text-white transition-colors duration-300">
            1
          </div>
          <span className="text-white font-bold text-xs text-center leading-tight">Quét QR</span>
          <span className="hidden md:block text-white/80 text-[10px] text-center mt-1">
            trên ảnh
          </span>
        </div>

        {/* STEP 2 */}
        <div className="flex flex-col items-center justify-center bg-black/40 backdrop-blur-xl p-3 rounded-2xl border border-white/20 shadow-2xl w-[100px] md:w-[130px] transform transition-all hover:scale-105 hover:bg-black/60 group cursor-default">
          <div className="w-10 h-10 rounded-full bg-white text-[#e11d48] flex items-center justify-center font-bold text-lg shadow-inner mb-1.5 group-hover:bg-[#e11d48] group-hover:text-white transition-colors duration-300">
            2
          </div>
          <span className="text-white font-bold text-xs text-center leading-tight">Xem Ảnh</span>
          <span className="hidden md:block text-white/80 text-[10px] text-center mt-1">
            trên quà
          </span>
        </div>

        {/* STEP 3 */}
        <div className="flex flex-col items-center justify-center bg-black/40 backdrop-blur-xl p-3 rounded-2xl border border-white/20 shadow-2xl w-[100px] md:w-[130px] transform transition-all hover:scale-105 hover:bg-black/60 group cursor-default">
          <div className="w-10 h-10 rounded-full bg-white text-[#e11d48] flex items-center justify-center font-bold text-lg shadow-inner mb-1.5 group-hover:bg-[#e11d48] group-hover:text-white transition-colors duration-300">
            3
          </div>
          <span className="text-white font-bold text-xs text-center leading-tight">Đặt Hàng</span>
          <span className="hidden md:block text-white/80 text-[10px] text-center mt-1">ngay</span>
        </div>
      </div>
    </div>
  )
}

export default ScanQRPageV2
