import { QRFrame } from '@/components/custom/QRFrame'
import { AppNavigator } from '@/utils/navigator'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { appLogger } from '@/logging/Logger'
import { EAppFeature, EAppPage, ELogLevel } from '@/utils/enums'

type TStarProps = {
  top?: string
  left?: string
  right?: string
  bottom?: string
  index: number
}

const Star = ({ top, left, right, bottom, index }: TStarProps) => {
  return (
    <div
      style={{
        top: top,
        left: left,
        right: right,
        bottom: bottom,
      }}
      className={`NAME-intro-star NAME-intro-star-${index} absolute w-14 h-14`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <path
          stroke="#fff"
          fill="#e60076"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
          d="m12 3 2.036 5.162c.188.476.282.714.425.915.128.178.284.334.462.462.2.143.439.237.915.425L21 12l-5.162 2.036c-.476.188-.714.282-.915.425a1.998 1.998 0 0 0-.462.462c-.143.2-.237.439-.425.915L12 21l-2.036-5.162c-.188-.476-.282-.714-.425-.915a1.999 1.999 0 0 0-.462-.462c-.2-.143-.439-.237-.915-.425L3 12l5.162-2.036c.476-.188.714-.282.915-.425a2 2 0 0 0 .462-.462c.143-.2.237-.439.425-.915L12 3Z"
        />
      </svg>
    </div>
  )
}

const IntroPage = () => {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const firstRenderRef = useRef(true)

  useEffect(() => {
    if (!firstRenderRef.current) return
    firstRenderRef.current = false

    const textInput = 'https://api.encycom.com/' + window.location.search + '&device=mobile'

    QRCode.toString(textInput, {
      type: 'svg',
      color: {
        dark: '#e60076',
        light: '#fff',
      },
    })
      .then((svgString) => {
        const parser = new DOMParser()
        const svgDoc = parser.parseFromString(svgString, 'image/svg+xml')
        const svgElement = svgDoc.documentElement
        containerRef.current?.querySelector('.NAME-qr-svg-placeholder')?.replaceWith(svgElement)
      })
      .catch((error) => {
        appLogger.logError(
          error,
          'Error generating QR code on intro page',
          EAppPage.INTRO,
          EAppFeature.INTRO_QR_CODE
        )
        console.error('>>> Lỗi tạo mã QR trên trang intro:', error)
      })
  }, [])

  const clickOnCTAButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    appLogger.logInfo(
      'User clicked on CTA button',
      EAppPage.INTRO,
      EAppFeature.INTRO_CTA_BUTTON,
      e.currentTarget
    )
    AppNavigator.navTo(navigate, '/qr')
  }

  return (
    <div className="h-screen w-screen bg-black">
      <div className="relative h-full w-full">
        <div
          ref={containerRef}
          className="absolute top-1/2 -translate-y-1/2 left-20 w-[460px] h-[460px] z-20"
        >
          <QRFrame />
        </div>

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
              src="https://photobooth-public.s3.ap-southeast-1.amazonaws.com/ptb-intro-video.mov"
              type="video/mp4"
            />
          </video>
        </div>
      </div>

      <div className="fixed top-1/2 -translate-y-1/2 right-16 z-20">
        <div className="relative inline-block group">
          <button
            onClick={clickOnCTAButton}
            className="NAME-intro-CTA-button relative bg-white border-main-cl border-b-6 px-14 py-6 text-main-cl font-black text-5xl rounded-full cursor-pointer tracking-wider flex items-center gap-3"
          >
            <Star index={1} top="-12px" left="-12px" />
            <Star index={2} top="-12px" right="-12px" />
            <Star index={3} bottom="-26px" left="30px" />
            <Star index={4} bottom="-26px" right="12px" />
            <Star index={5} top="-26px" right="32px" />

            {/* <!-- Vùng chứa text sẽ được xử lý JS --> */}
            <span className="relative z-10 flex">
              <span className="text-[1em]">M</span>
              <span className="text-[1em]">U</span>
              <span className="text-[1em] inline-block mr-3">A</span>
              <span className="text-[1em]">N</span>
              <span className="text-[1em]">G</span>
              <span className="text-[1em]">A</span>
              <span className="text-[1em]">Y</span>
            </span>

            {/* Icon mũi tên */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 relative z-10 text-main-cl fill-main-cl rotate-12"
              viewBox="-1 0 19 19"
            >
              <path d="m15.867 7.593-1.534.967a.544.544 0 0 1-.698-.118l-.762-.957v7.256a.476.476 0 0 1-.475.475h-7.79a.476.476 0 0 1-.475-.475V7.477l-.769.965a.544.544 0 0 1-.697.118l-1.535-.967a.387.387 0 0 1-.083-.607l2.245-2.492a2.814 2.814 0 0 1 2.092-.932h.935a2.374 2.374 0 0 0 4.364 0h.934a2.816 2.816 0 0 1 2.093.933l2.24 2.49a.388.388 0 0 1-.085.608z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default IntroPage
