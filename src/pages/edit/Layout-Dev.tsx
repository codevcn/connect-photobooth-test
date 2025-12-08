import { productService } from '@/services/product.service'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EditPage from './Page'
import { PageLoading } from '@/components/custom/Loading'
import { useProductStore } from '@/stores/product/product.store'
import { usePrintedImageStore } from '@/stores/printed-image/printed-image.store'
import { TPrintedImage, TUserInputImage } from '@/utils/types/global'
import { generateUniqueId } from '@/utils/helpers'
import { toast } from 'react-toastify'
import { useFastBoxes } from '@/hooks/use-fast-boxes'
import { qrGetter } from '@/configs/brands/photoism/qr-getter-Dev'

const LayoutDev = () => {
  const [error, setError] = useState<string | null>(null)
  const products = useProductStore((s) => s.products)
  const setProducts = useProductStore((s) => s.setProducts) //>>> checked: OK
  const printedImages = usePrintedImageStore((s) => s.printedImages)
  const [fetched, setFetched] = useState<number>(0)
  const navigate = useNavigate()
  const { detectFromFile, isReady } = useFastBoxes()
  const setPrintedImages = usePrintedImageStore((s) => s.setPrintedImages)

  const onScanSuccess = async (imageDataList: TUserInputImage[]) => {
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
          setFetched(2)
        }
      }
      img.onerror = () => {
        toast.error('Đã có lỗi xảy ra khi tải hình ảnh. Có 1 số ảnh không được xử lý.')
      }
      img.src = imageData.url
    }
  }

  const fetchPrintedImages = () => {
    if (!isReady) return
    setTimeout(() => {
      qrGetter.setDetectFromFileHandler(detectFromFile as any)
      qrGetter
        .handleImageData('https://qr.seobuk.kr/s/IMfkz6.', (percentage, images, error) => {
          if (error) {
            console.error('>>> [qr] Lỗi lấy dữ liệu mã QR:', error)
            setError('Không thể lấy dữ liệu từ mã QR. Vui lòng thử lại.')
            toast.error(error.message)
            return
          }
          if (images) {
            console.log('>>> [qr] images extracted:', images)
            onScanSuccess(
              images.map((img) => ({
                ...img,
                url: img.isOriginalImage ? img.url : URL.createObjectURL(img.blob),
              }))
            )
          }
        })
        .catch((err) => {
          console.error('>>> [qr] Lỗi xử lý dữ liệu mã QR:', err)
          setError('Không thể xử lý mã QR. Vui lòng thử lại.')
          toast.error('Không thể xử lý mã QR. Vui lòng thử lại.')
        })
    }, 500)
  }

  useEffect(() => {
    if (printedImages.length === 0) fetchPrintedImages()
  }, [isReady, printedImages.length])

  const fetchProducts = async () => {
    try {
      const data = await productService.fetchProductsByPage(1, 20)
      setProducts(data)
      setFetched(1)
    } catch (error) {
      console.log('>>> error:', error)
      setError('Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.')
    }
  }

  useEffect(() => {
    if (fetched > 1 && (products.length === 0 || printedImages.length === 0)) {
      setError('Không có sản phẩm hoặc hình in nào để chỉnh sửa.')
    }
  }, [products, printedImages])

  useEffect(() => {
    if (products.length === 0) fetchProducts()
  }, [])

  return error ? (
    <div className="flex flex-col items-center justify-center w-screen h-screen p-6">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="56"
        height="56"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-circle-alert-icon lucide-circle-alert text-main-cl"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
      </svg>
      <p className="text-main-cl text-lg text-center font-bold mt-2">{error}</p>
      <button
        onClick={() => navigate('/')}
        className="bg-main-cl text-white text-lg font-bold px-4 py-2 rounded mt-4"
      >
        Quay lại trang chủ
      </button>
    </div>
  ) : products.length > 0 && printedImages.length > 0 ? (
    <EditPage products={products} printedImages={printedImages} />
  ) : (
    <PageLoading message="Đang tải dữ liệu..." />
  )
}

export default LayoutDev
