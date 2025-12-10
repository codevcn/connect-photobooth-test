import QRScanner from './QRScanner'
import { TPrintedImage, TUserInputImage } from '@/utils/types/global'
import { useNavigate } from 'react-router-dom'
import { usePrintedImageStore } from '@/stores/printed-image/printed-image.store'
import { fillQueryStringToURL, generateUniqueId } from '@/utils/helpers'
import { toast } from 'react-toastify'

const ScanQRPage = () => {
  const setPrintedImages = usePrintedImageStore((s) => s.setPrintedImages)
  const navigate = useNavigate()

  const handleData = async (imageDataList: TUserInputImage[]) => {
    setPrintedImages([])
    const imagesToAdd: TPrintedImage[] = []
    for (const imageData of imageDataList) {
      const img = new Image()
      img.onload = () => {
        imagesToAdd.push({
          url: imageData.url,
          height: img.naturalHeight,
          width: img.naturalWidth,
          id: generateUniqueId(),
          isOriginalImage: imageData.isOriginalImage,
        })
        if (imagesToAdd.length === imageDataList.length) {
          imagesToAdd.sort((a, b) => b.width * b.height - a.width * a.height) // ảnh có kích thước lớn nhất phải ở đầu tiên trong danh sách
          setPrintedImages(imagesToAdd)
          navigate('/edit' + fillQueryStringToURL())
        }
      }
      img.onerror = () => {
        toast.error('Đã có lỗi xảy ra khi tải hình ảnh. Có 1 số ảnh không được xử lý.')
      }
      img.src = imageData.url
    }
  }

  return (
    <div className="relative flex items-center justify-center h-screen w-screen overflow-hidden">
      {/* HTML Background with Bubbles */}
      <div className="absolute inset-0 z-0">
        <iframe
          src="/scan-qr-background.html"
          className="w-full h-full border-0"
          title="Background Animation"
        />
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      </div>

      {/* Main Content */}
      <section className="NAME-scan-qr-main-content relative z-10 bg-white/20 backdrop-blur-sm rounded-2xl shadow-2xl p-2">
        {/* <div className="flex items-center justify-center gap-3 animate-fade-in-down">
          <div
            onClick={() => navigate('/edit')}
            className="bg-main-cl p-3 rounded-xl shadow-lg animate-float"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-camera-icon lucide-camera text-white"
            >
              <path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Quét mã QR</h1>
        </div> */}

        <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <QRScanner onScanSuccess={handleData} />
        </div>
      </section>
    </div>
  )
}

export default ScanQRPage
