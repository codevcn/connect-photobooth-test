import { productService } from '@/services/product.service'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EditPage from './Page'
import { PageLoading } from '@/components/custom/Loading'
import { useProductStore } from '@/stores/product/product.store'
import { usePrintedImageStore } from '@/stores/printed-image/printed-image.store'

const PageWrapper = () => {
  const [error, setError] = useState<string | null>(null)
  const products = useProductStore((s) => s.products)
  const setProducts = useProductStore((s) => s.setProducts)
  const printedImages = usePrintedImageStore((s) => s.printedImages)
  const [fetched, setFetched] = useState<boolean>(false)
  const navigate = useNavigate()

  const fetchProducts = async () => {
    try {
      const data = await productService.fetchProductsByPage(1, 20)
      console.log('>>> [ser] service fetch products by page:', data)
      setProducts(data)
      setFetched(true)
    } catch (error) {
      console.log('>>> error:', error)
      setError('Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.')
    }
  }

  useEffect(() => {
    if (fetched && (products.length === 0 || printedImages.length === 0)) {
      setError('Không có sản phẩm hoặc hình in nào để chỉnh sửa.')
    }
  }, [products, printedImages])

  useEffect(() => {
    fetchProducts()
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

export default PageWrapper
