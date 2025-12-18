import { isHomePage } from '@/utils/helpers'
import { useEffect, useRef, useState, useCallback } from 'react'

type TUseIdleDetectorOptions = {
  idleTimeout: number // Thời gian không hoạt động (ms)
  warningTimeout: number // Thời gian cảnh báo (ms)
  onIdle: () => void // Callback khi hết thời gian cảnh báo
}

/**
 * Hook phát hiện user không hoạt động (toàn cục)
 * - Đếm ngược từ idleTimeout, reset khi user chạm màn hình
 * - Khi hết thời gian, hiện modal cảnh báo trong warningTimeout
 * - Nếu không xác nhận, gọi onIdle callback
 */
export const useIdleDetector = ({
  idleTimeout,
  warningTimeout,
  onIdle,
}: TUseIdleDetectorOptions) => {
  const [showWarning, setShowWarning] = useState(false)
  const [warningCountdown, setWarningCountdown] = useState(0)

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null)
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null)
  const warningCountdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const showWarningRef = useRef(false)

  // Sử dụng ref để lưu giá trị props mới nhất, tránh stale closure
  const idleTimeoutRef = useRef(idleTimeout)
  const warningTimeoutRef = useRef(warningTimeout)
  const onIdleRef = useRef(onIdle)

  // Cập nhật ref mỗi khi props thay đổi
  useEffect(() => {
    idleTimeoutRef.current = idleTimeout
    warningTimeoutRef.current = warningTimeout
    onIdleRef.current = onIdle
  }, [idleTimeout, warningTimeout, onIdle])

  // Reset idle timer - sử dụng useCallback để stable reference
  const resetIdleTimer = useCallback(() => {
    // Clear existing timers
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current)
    }
    if (warningCountdownIntervalRef.current) {
      clearInterval(warningCountdownIntervalRef.current)
    }

    // Reset states
    setShowWarning(false)
    showWarningRef.current = false
    setWarningCountdown(0)

    // Start new idle timer - sử dụng giá trị từ ref
    const timerId = setTimeout(() => {
      // QUAN TRỌNG: Kiểm tra xem timer này có còn là timer active không
      // Nếu đã bị cancel/replaced, không làm gì cả
      if (idleTimerRef.current !== timerId) return

      setShowWarning(true)
      showWarningRef.current = true
      const initialCountdown = Math.floor(warningTimeoutRef.current / 1000)
      setWarningCountdown(initialCountdown)

      // Start countdown interval
      let countdown = initialCountdown
      warningCountdownIntervalRef.current = setInterval(() => {
        countdown -= 1
        setWarningCountdown(countdown)
        if (countdown <= 0) {
          if (warningCountdownIntervalRef.current) {
            clearInterval(warningCountdownIntervalRef.current)
          }
        }
      }, 1000)

      // Start warning timer - sử dụng giá trị từ ref
      warningTimerRef.current = setTimeout(() => {
        onIdleRef.current() // ← Dùng ref để có callback mới nhất
        setShowWarning(false)
      }, warningTimeoutRef.current) // ← Dùng ref
    }, idleTimeoutRef.current)
    
    // Lưu timer ID
    idleTimerRef.current = timerId
  }, []) // Dependencies rỗng vì tất cả giá trị đều từ ref

  // User confirms they are still active
  const confirmActive = useCallback(() => {
    resetIdleTimer()
  }, [resetIdleTimer])

  // Setup event listeners
  useEffect(() => {
    // if (isHomePage()) {
    //   return
    // }
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

    const handleUserActivity = () => {
      // Reset timer khi user có hoạt động, bất kể đang hiển thị warning hay không
      // Nếu đang hiển thị warning, ẩn nó đi vì user đã active
      if (showWarningRef.current) {
        setShowWarning(false)
        showWarningRef.current = false
      }
      resetIdleTimer()
    }

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleUserActivity)
    })

    // Start initial timer
    resetIdleTimer()

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleUserActivity)
      })
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
      if (warningCountdownIntervalRef.current) clearInterval(warningCountdownIntervalRef.current)
    }
  }, [resetIdleTimer]) // Thêm resetIdleTimer vào dependencies

  return {
    showWarning,
    warningCountdown,
    confirmActive,
  }
}
