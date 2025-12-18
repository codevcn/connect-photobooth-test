import { useState, useEffect, useRef } from 'react'

type TIdleWarningModalProps = {
  show: boolean
  countdown: number
  onConfirm: () => void
}

const IdleWarningModal = ({ show, countdown, onConfirm }: TIdleWarningModalProps) => {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-4 max-w-md w-full mx-4 border-4 border-blue-500">
        {/* Icon Warning */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
            <div className="relative bg-linear-to-br from-blue-500 to-blue-600 p-5 rounded-full shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-3">
          Bạn vẫn đang ở đây chứ?
        </h2>

        {/* Description */}
        <p className="text-gray-800 text-center mb-6 leading-relaxed">
          Chúng tôi nhận thấy bạn không có hoạt động. Nếu bạn vẫn muốn tiếp tục, vui lòng xác nhận.
        </p>

        {/* Countdown */}
        <div className="bg-linear-to-br from-blue-500/10 to-blue-600/10 rounded-2xl p-6 mb-6 border-2 border-blue-500/30">
          <div className="text-center">
            <p className="text-sm text-gray-800 mb-2 font-medium">Thời gian còn lại</p>
            <div className="flex items-center justify-center gap-2">
              <div className="bg-white rounded-xl px-6 py-3 shadow-md border-2 border-blue-500">
                <span className="text-4xl font-bold text-blue-500 tabular-nums">{countdown}</span>
              </div>
              <span className="text-2xl font-bold text-gray-600">giây</span>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={onConfirm}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Vâng, tôi vẫn ở đây!</span>
        </button>

        {/* Info Text */}
        <p className="text-sm text-gray-800 text-center mt-4">
          Nếu không xác nhận, bạn sẽ được chuyển về trang chủ
        </p>
      </div>
    </div>
  )
}

type TUserIdleTrackerProps = {
  idleTimeout?: number // Thời gian idle (giây) trước khi hiện modal
  modalTimeout?: number // Thời gian đếm ngược trong modal (giây)
  onTimeout?: () => void // Callback khi user không xác nhận
}

export const UserIdleTracker = ({
  idleTimeout = 10,
  modalTimeout = 10,
  onTimeout,
}: TUserIdleTrackerProps) => {
  const [showModal, setShowModal] = useState(false)
  const [modalCountdown, setModalCountdown] = useState(modalTimeout)
  const [idleCountdown, setIdleCountdown] = useState(idleTimeout)

  const idleTimerRef = useRef<NodeJS.Timeout | null>(null)
  const modalTimerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Reset idle timer về giá trị ban đầu
  const resetIdleTimer = () => {
    // Clear các timer cũ
    if (idleTimerRef.current) {
      clearInterval(idleTimerRef.current)
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
    }

    // Reset countdown
    setIdleCountdown(idleTimeout)

    // Bắt đầu đếm ngược idle
    let currentCount = idleTimeout
    countdownIntervalRef.current = setInterval(() => {
      currentCount--
      setIdleCountdown(currentCount)

      if (currentCount <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current)
        }
      }
    }, 1000)

    // Set timer để hiện modal khi hết thời gian
    idleTimerRef.current = setTimeout(() => {
      setShowModal(true)
      startModalCountdown()
    }, idleTimeout * 1000)
  }

  // Bắt đầu đếm ngược modal
  const startModalCountdown = () => {
    setModalCountdown(modalTimeout)

    let currentCount = modalTimeout
    modalTimerRef.current = setInterval(() => {
      currentCount--
      setModalCountdown(currentCount)

      if (currentCount <= 0) {
        handleModalTimeout()
      }
    }, 1000)
  }

  // Xử lý khi modal timeout
  const handleModalTimeout = () => {
    if (modalTimerRef.current) {
      clearInterval(modalTimerRef.current)
    }
    setShowModal(false)

    // Gọi callback nếu có
    if (onTimeout) {
      onTimeout()
    } else {
      // Mặc định chuyển về trang chủ
      window.location.href = '/'
    }
  }

  // Xử lý khi user xác nhận
  const handleConfirm = () => {
    // Clear modal timer
    if (modalTimerRef.current) {
      clearInterval(modalTimerRef.current)
    }

    // Đóng modal
    setShowModal(false)

    // Reset idle timer
    resetIdleTimer()
  }

  // Xử lý các sự kiện user activity
  const handleUserActivity = () => {
    if (!showModal) {
      resetIdleTimer()
    }
  }

  useEffect(() => {
    // Khởi tạo idle timer lần đầu
    resetIdleTimer()

    // Lắng nghe các sự kiện user activity
    const events = ['pointerdown', 'pointermove']

    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity)
    })

    // Cleanup
    return () => {
      if (idleTimerRef.current) {
        clearInterval(idleTimerRef.current)
      }
      if (modalTimerRef.current) {
        clearInterval(modalTimerRef.current)
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }

      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity)
      })
    }
  }, [idleTimeout, modalTimeout])

  return (
    <>
      {/* Debug info - có thể xóa trong production */}
      <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 text-sm">
        <div className="font-semibold mb-2">Idle Tracker Debug</div>
        <div>
          Idle countdown: <span className="font-mono font-bold">{idleCountdown}s</span>
        </div>
        <div>Modal: {showModal ? '✅ Hiển thị' : '❌ Ẩn'}</div>
      </div>

      <IdleWarningModal show={showModal} countdown={modalCountdown} onConfirm={handleConfirm} />
    </>
  )
}
