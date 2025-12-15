import { productService } from '@/services/product.service'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import EditPage from './Page'
import { PageLoading } from '@/components/custom/Loading'
import { useProductStore } from '@/stores/product/product.store'
import { usePrintedImageStore } from '@/stores/printed-image/printed-image.store'
import { apiClient } from '@/services/api/api-client'
import { TBaseProduct, TPrintedImage, TUserInputImage } from '@/utils/types/global'
import { generateUniqueId } from '@/utils/helpers'
import { toast } from 'react-toastify'
import { LocalStorageHelper } from '@/utils/localstorage'

const LayoutFUN = () => {
  const [error, setError] = useState<string | null>(null)
  const products = useProductStore((s) => s.products)
  const setProducts = useProductStore((s) => s.setProducts) //>>> checked: OK
  const printedImages = usePrintedImageStore((s) => s.printedImages)
  const [fetched, setFetched] = useState<boolean>(false)
  const navigate = useNavigate()
  const fetchIdByPartner = useSearchParams()[0].get('funstudio')

  const fetchPrintedImagesFromFunStudio = async (fetchId: string) => {
    const data = await fetch('https://api.encycom.com/api/get/' + fetchId, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const json = await data.json()
    LocalStorageHelper.setPtbid(json.ptbid)
    console.log('>>> json:', json)

    return await new Promise<TPrintedImage[]>((resolve, reject) => {
      const handleData = async (imageDataList: string[]) => {
        const imagesToAdd: TPrintedImage[] = []
        for (const imageData of imageDataList) {
          const img = new Image()
          img.onload = () => {
            imagesToAdd.push({
              url: imageData,
              height: img.naturalHeight,
              width: img.naturalWidth,
              id: generateUniqueId(),
              isOriginalImage: true,
            })
            if (imagesToAdd.length === imageDataList.length) {
              imagesToAdd.sort((a, b) => b.width * b.height - a.width * a.height) // ảnh có kích thước lớn nhất PHẢI ở đầu tiên trong danh sách
              imagesToAdd[0].isOriginalImage = true
              // const largestSizeImage = imagesToAdd[0]
              // const largestArea = largestSizeImage.width * largestSizeImage.height
              // for (const img of imagesToAdd) {
              // if (img.width * img.height === largestArea) {
              // img.isOriginalImage = true
              // }
              // }
              resolve(imagesToAdd)
            }
          }
          img.onerror = () => {
            toast.error('Đã có lỗi xảy ra khi tải hình ảnh. Có 1 số ảnh không được xử lý.')
            reject(new Error('Đã có lỗi xảy ra khi tải hình ảnh. Có 1 số ảnh không được xử lý.'))
          }
          img.src = imageData
        }
      }
      handleData(json.listimg)
    })
  }

  const fetchProducts = async (): Promise<TBaseProduct[]> => {
    try {
      const data = await productService.fetchProductsByPage(1, 20)
      return data
    } catch (error) {
      console.error('>>> error:', error)
      setError('Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.')
      throw error
    }
  }

  const fetchDataToEdit = async () => {
    const data = await Promise.all([
      fetchProducts(),
      fetchPrintedImagesFromFunStudio(fetchIdByPartner || ''),
    ])
    setProducts(data[0])
    usePrintedImageStore.getState().setPrintedImages(data[1])
    setFetched(true)
  }

  useEffect(() => {
    if (fetched && (products.length === 0 || printedImages.length === 0)) {
      setError('Không có sản phẩm hoặc hình in nào để chỉnh sửa.')
    }
  }, [products, printedImages])

  useEffect(() => {
    fetchDataToEdit()
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

export default LayoutFUN
