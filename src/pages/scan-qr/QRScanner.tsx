import { useCallback, useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'
import { qrGetter } from '@/configs/brands/photoism/qr-getter'
import { toast } from 'react-toastify'
import { TUserInputImage } from '@/utils/types/global'
import { useFastBoxes } from '@/hooks/use-fast-boxes'

type QRScannerProps = {
  onScanSuccess: (result: TUserInputImage[]) => Promise<void>
}

export default function QRScanner({ onScanSuccess }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<QrScanner | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string>('')
  const { detectFromFile, isReady } = useFastBoxes()

  const initializeScanner = useCallback(() => {
    if (!videoRef.current) return
    console.log('>>> [qr] run this initializeScanner:', videoRef.current)
    const qrScanner = new QrScanner(
      videoRef.current,
      (result) => {
        console.log('>>> [qr] scan result:', { result, isScanning })
        if (!isScanning) {
          setIsScanning(true)
          qrScanner.stop()
          qrGetter
            .handleImageData(result.data, (percentage, images, error) => {
              setProgress(percentage)
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
          // qrGetter
          //   .handleImageData(result.data, (percentage, images, error) => {
          //     setProgress(percentage)
          //     if (error) {
          //       console.error('>>> Lỗi lấy dữ liệu mã QR:', error)
          //       setError('Không thể lấy dữ liệu từ mã QR. Vui lòng thử lại.')
          //       toast.error('Không thể lấy dữ liệu từ mã QR. Vui lòng thử lại.')
          //       return
          //     }
          //     if (images) {
          //       onScanSuccess(
          //         images.map((img) => ({
          //           ...img,
          //           url: img.isOriginalImage ? img.url : URL.createObjectURL(img.blob),
          //         }))
          //       )
          //     }
          //   })
          //   .catch((err) => {
          //     console.error('>>> Lỗi xử lý dữ liệu mã QR:', err)
          //     setError('Không thể xử lý mã QR. Vui lòng thử lại.')
          //     toast.error('Không thể xử lý mã QR. Vui lòng thử lại.')
          //   })
        }
      },
      {
        returnDetailedScanResult: true,
        highlightScanRegion: true,
        highlightCodeOutline: true,
        // Tăng tần suất quét
        maxScansPerSecond: 10, // Tăng từ 1 lên 10
        // Giảm chất lượng video để xử lý nhanh hơn
        // calculateScanRegion: (video) => {
        //   // Chỉ quét vùng trung tâm (giảm diện tích cần xử lý)
        //   const smallestDimension = Math.min(video.videoWidth, video.videoHeight)
        //   const scanRegionSize = Math.round(0.7 * smallestDimension)
        //   return {
        //     x: Math.round((video.videoWidth - scanRegionSize) / 2),
        //     y: Math.round((video.videoHeight - scanRegionSize) / 2),
        //     width: scanRegionSize,
        //     height: scanRegionSize,
        //   }
        // },
      }
    )
    scannerRef.current = qrScanner
    qrScanner.start().catch((error) => {
      console.log('>>> [qr] error:', error)
      setError('Không thể truy cập camera. Vui lòng cấp quyền sử dụng camera.')
      toast.error('Không thể truy cập camera. Vui lòng cấp quyền sử dụng camera.')
    })
    return () => {
      qrScanner.stop()
      qrScanner.destroy()
    }
  }, [isScanning])

  const stopCamera = useCallback(() => {
    const scanner = scannerRef.current
    if (scanner) {
      scanner.stop()
      scanner.destroy()
      scannerRef.current = null
    }

    // Dừng hẳn stream media (tắt camera vật lý)
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }

    setIsScanning(false)
    console.log('>>> Camera đã được tắt hoàn toàn.')
  }, [])

  useEffect(() => {
    if (!isReady) return
    qrGetter.setDetectFromFileHandler(detectFromFile as any)
    // initializeScanner()
    if (error) {
      stopCamera()
    }
    return () => {
      stopCamera()
    }
  }, [error, isReady])

  useEffect(() => {
    if (!isReady) return
    setTimeout(() => {
      qrGetter.setDetectFromFileHandler(detectFromFile as any)
      qrGetter
        .handleImageData('https://qr.seobuk.kr/s/IMfkz6.', (percentage, images, error) => {
          setProgress(percentage)
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
  }, [isReady])

  return (
    <div className="w-full">
      <div className="relative aspect-square bg-gray-900 rounded-2xl overflow-hidden shadow-lg max-h-[90vh]">
        <video
          ref={videoRef}
          className="max-w-[600px] max-h-[90vh] w-full h-full object-cover transition-transform duration-300"
          playsInline
        />
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 p-4 animate-fade-in-down">
            <p className="text-red-600 text-lg font-bold text-center">{error}</p>
          </div>
        ) : (
          <>
            {isScanning && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center animate-fade-in-down">
                <div className="w-4/5">
                  <div className="bg-white rounded-full h-4 overflow-hidden mb-4 shadow-lg">
                    <div
                      className="bg-pink-400 h-full transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-white text-center font-medium animate-pulse">
                    <span>Đang xử lý ảnh của bạn...</span>
                    <span> {progress}</span>
                    <span>%</span>
                  </p>
                </div>
              </div>
            )}
            {!isScanning && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-pink-400 rounded-lg opacity-30 animate-pulse"></div>
              </div>
            )}
          </>
        )}
      </div>
      {!isScanning && !error && (
        <p
          className="text-center mt-2 text-white text-sm animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          Hãy đưa mã QR vào khung để quét
        </p>
      )}
    </div>
    // <></>
  )
}
