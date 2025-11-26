import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { FullscreenModal } from '@/components/custom/FullscreenModal'

const IntroPage = () => {
  const navigate = useNavigate()
  const [showFullscreenModal, setShowFullscreenModal] = useState(true)

  return (
    <div className="h-screen w-screen bg-black">
      {/* Fullscreen Modal */}
      {/* <FullscreenModal
        show={showFullscreenModal}
        onConfirm={() => setShowFullscreenModal(false)}
      /> */}

      <div className="relative h-full w-full">
        <div className="relative h-full w-full z-10">
          <video
            className="NAME-intro-video w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            controlsList="nodownload"
          >
            <source src="/videos/intro-video.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

      {/* Call to Action Button */}
      <div className="fixed top-1/2 -translate-y-1/2 md:top-6 md:translate-y-0 left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={() => navigate('/qr')}
          className="group relative px-4 w-max py-4 bg-linear-to-r from-main-cl to-main-hover-cl text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-main-cl/50 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
        >
          {/* Animated background shimmer */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent animate-shimmer" />

          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-full bg-main-cl opacity-75 animate-ping-slow" />

          {/* Button content */}
          <span className="relative z-10 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-bounce-slow"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
            Thử ngay
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-bounce-slow"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>

          {/* Glowing border effect */}
          <div className="absolute inset-0 rounded-full border-2 border-white/50 animate-pulse-glow" />
        </button>
      </div>
    </div>
  )
}

export default IntroPage
