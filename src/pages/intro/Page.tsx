import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { fillQueryStringToURL } from '@/utils/helpers'

const Star = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-sparkle-icon lucide-sparkle w-6 h-6 text-main-cl fill-main-cl"
    >
      <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
    </svg>
  )
}

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
            <source
              src="https://photobooth-public.s3.ap-southeast-1.amazonaws.com/dev+(9-12)(2)+(2).mov"
              type="video/mp4"
            />
          </video>
        </div>
      </div>

      <div className="fixed top-1/2 -translate-y-1/2 md:bottom-8 md:top-auto md:translate-y-0 left-1/2 -translate-x-1/2 z-20">
        <div className="relative inline-block group">
          {/* <Star />
          <Star />
          <Star />
          <Star /> */}
          <button
            onClick={() => navigate('/qr' + fillQueryStringToURL())}
            className="NAME-call-to-action-button animate-[call-to-action-button_1s_infinite] cursor-pointer relative flex items-center gap-3 bg-white text-main-cl font-bold px-12 py-5 rounded-full border-b-8 border-r-4 border-gray-200 hover:border-gray-300 active:border-b-0 active:border-r-0 active:translate-y-2 active:translate-x-1 shadow-2xl transition-all duration-150 text-2xl uppercase tracking-widest"
          >
            <span>Thử ngay</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform group-hover:translate-x-2"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default IntroPage
