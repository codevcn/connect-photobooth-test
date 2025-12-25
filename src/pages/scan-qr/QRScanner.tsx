import { useCallback, useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'
import { qrGetter } from '@/configs/brands/photoism/qr-getter'
import { toast } from 'react-toastify'
import { TUserInputImage } from '@/utils/types/global'
import { useFastBoxes } from '@/hooks/use-fast-boxes'
import { useNavigate } from 'react-router-dom'
import { AppNavigator } from '@/utils/navigator'
import { SectionLoading } from '@/components/custom/Loading'
import { checkIfLargeScreen } from '@/utils/helpers'
import { appLogger } from '@/logging/Logger'
import { EAppFeature, EAppPage, ELogLevel } from '@/utils/enums'
import { EInternalEvents, eventEmitter } from '@/utils/events'

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
  const navigate = useNavigate()
  const [cameraIsActive, setCameraIsActive] = useState(false)

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
                appLogger.logError(
                  error,
                  'Error extracting QR code data',
                  EAppPage.SCAN_QR,
                  EAppFeature.QR_EXTRACT_DATA
                )
                setError('Không thể lấy dữ liệu từ mã QR. Vui lòng thử lại.')
                toast.error('Không thể lấy dữ liệu từ mã QR. Vui lòng thử lại')
                setTimeout(() => {
                  AppNavigator.navTo(navigate, '/')
                }, 3000)
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
              appLogger.logError(
                err,
                'Error processing QR code data',
                EAppPage.SCAN_QR,
                EAppFeature.QR_EXTRACT_DATA
              )
              setError('Không thể xử lý mã QR. Vui lòng thử lại.')
              toast.error('Không thể xử lý mã QR. Vui lòng thử lại.')
            })
        }
      },
      {
        onDecodeError: (error) => {
          console.error('>>> [qr] decode qr error:', error)
          appLogger.logError(
            error instanceof Error ? error : new Error(error),
            'QR decode error',
            EAppPage.SCAN_QR,
            EAppFeature.QR_EXTRACT_DATA
          )
        },
        returnDetailedScanResult: true,
        highlightScanRegion: true,
        highlightCodeOutline: true,
        maxScansPerSecond: 15, // Tăng tần suất quét mã QR
        // Tăng vùng quét QR lên gần như toàn bộ camera (padding 16px)
        calculateScanRegion: (video) => {
          const padding = checkIfLargeScreen() ? 16 : 30 // Padding 16px từ mỗi cạnh
          const smallerDimension = Math.min(video.videoWidth, video.videoHeight)
          const scanRegionSize = smallerDimension - padding * 2
          return {
            x: Math.round((video.videoWidth - scanRegionSize) / 2),
            y: Math.round((video.videoHeight - scanRegionSize) / 2),
            width: scanRegionSize,
            height: scanRegionSize,
            downScaledWidth: scanRegionSize,
            downScaledHeight: scanRegionSize,
          }
        },
      }
    )
    scannerRef.current = qrScanner
    qrScanner
      .start()
      .then(() => {
        appLogger.logInfo(
          'Camera started successfully',
          EAppPage.SCAN_QR,
          EAppFeature.QR_LAUNCH_CAMERA
        )
        setCameraIsActive(true)
      })
      .catch((error) => {
        console.log('>>> [qr] error:', error)
        appLogger.logError(
          error,
          'Cannot start camera',
          EAppPage.SCAN_QR,
          EAppFeature.QR_LAUNCH_CAMERA
        )
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
    appLogger.logInfo('Camera stopped', EAppPage.SCAN_QR, EAppFeature.QR_LAUNCH_CAMERA)
  }, [])

  const startScanning = () => {
    qrGetter.setDetectFromFileHandler(detectFromFile as any)
    const videoElement = videoRef.current
    if (videoElement) {
      const videoWrapper = videoElement.closest<HTMLElement>('.NAME-video-wrapper')
      if (videoWrapper) {
        // const { width, height } = videoElement.getBoundingClientRect()
        // if (width > height) {
        //   videoElement.style.width = `${height}px`
        //   videoWrapper.style.width = `${height}px`
        //   videoWrapper.style.height = `${height}px`
        // } else {
        //   videoElement.style.height = `${width}px`
        //   videoWrapper.style.height = `${width}px`
        //   videoWrapper.style.width = `${width}px`
        // }
        requestAnimationFrame(() => {
          initializeScanner()
        })
      }
    }
    if (error) {
      stopCamera()
    }
  }

  useEffect(() => {
    if (!isReady) return
    startScanning()
    return () => {
      stopCamera()
    }
  }, [error, isReady])

  const doTest = () => {
    if (!isReady) {
      toast.warning('Chưa sẵn sàng để xử lý mã QR. Vui lòng thử lại sau.')
      return
    } else {
      toast.info('Bắt đầu xử lý mã QR thử nghiệm...')
    }
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
    }, 200)
  }

  // useEffect(() => {
  //   doTest()
  // }, [isReady])

  // useEffect(() => {
  //   eventEmitter.on(EInternalEvents.DO_TEST_PASS_SCAN_QR, doTest)
  //   return () => {
  //     eventEmitter.off(EInternalEvents.DO_TEST_PASS_SCAN_QR, doTest)
  //   }
  // }, [isReady])

  return (
    <div className="smd:px-0 smd:w-fit h-[calc(100vh-250px)] px-4 w-full pointer-events-none">
      <div className="NAME-video-wrapper smd:w-fit h-full w-full relative aspect-square bg-gray-900 rounded-2xl overflow-hidden shadow-lg">
        {!cameraIsActive && (
          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-white font-bold text-2xl">
            <SectionLoading
              message="Đang truy cập Camera..."
              classNames={{ message: 'text-white text-2xl', shapesContainer: 'text-white' }}
            />
          </div>
        )}
        <video
          ref={videoRef}
          className="max-h-full max-w-full w-full h-full aspect-square object-cover transition-transform duration-300"
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
          </>
        )}
      </div>
    </div>
  )
}
