import { EInternalEvents, eventEmitter } from '@/utils/events'
import { useEffect, useRef, useState } from 'react'
import { useTemplateStore } from '@/stores/ui/template.store'

type TGrayscaleControlProps = {}

const GrayscaleControl = ({}: TGrayscaleControlProps) => {
  const [showPopover, setShowPopover] = useState(false)
  const pickedTemplate = useTemplateStore((s) => s.pickedTemplate)
  const updateTemplateGrayscale = useTemplateStore((s) => s.updateTemplateGrayscale)
  const [grayscale, setGrayscale] = useState(pickedTemplate?.initialVisualState?.grayscale || 0)

  const popoverRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setGrayscale(pickedTemplate?.initialVisualState?.grayscale || 0)
  }, [pickedTemplate?.initialVisualState?.grayscale])

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        buttonRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setShowPopover(false)
      }
    }

    if (showPopover) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPopover])

  const handleGrayscaleChange = (value: number) => {
    setGrayscale(value)
    if (pickedTemplate) {
      updateTemplateGrayscale(pickedTemplate.id, value)
    }
  }

  return (
    <div className="relative w-full h-full">
      <button
        ref={buttonRef}
        onClick={() => setShowPopover(!showPopover)}
        className="group flex items-center justify-center font-bold gap-1 text-inherit rounded p-1 w-full h-full"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 smd:w-5 smd:h-5 5xl:w-7 5xl:h-7"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2v20" />
        </svg>
        <span className="5xl:text-[1em] text-xs smd:text-sm">Trắng đen</span>
      </button>

      {showPopover && (
        <div
          ref={popoverRef}
          className="absolute -right-1 top-[calc(100%+4px)] bg-white border-2 border-main-cl rounded-lg shadow-xl p-3 z-999"
          style={{
            minWidth: '200px',
            maxWidth: '280px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-row items-center gap-3">
            <span className="text-xs font-semibold text-main-cl whitespace-nowrap">0%</span>

            <div className="relative flex-1 flex items-center">
              <input
                type="range"
                min="0"
                max="100"
                value={grayscale}
                onChange={(e) => handleGrayscaleChange(Number(e.target.value))}
                className="w-full cursor-pointer accent-main-cl"
                style={{
                  height: '8px',
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${grayscale}%, #e5e7eb ${grayscale}%, #e5e7eb 100%)`,
                  borderRadius: '4px',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                }}
              />
            </div>

            <span className="text-xs font-semibold text-main-cl whitespace-nowrap">100%</span>
          </div>
        </div>
      )}
    </div>
  )
}

type TChangePrintedImageProps = {
  frameId: string
}

const ChangePrintedImage = ({ frameId }: TChangePrintedImageProps) => {
  const handleShowPrintedImagesModal = () => {
    eventEmitter.emit(EInternalEvents.HIDE_SHOW_PRINTED_IMAGES_MODAL, true, frameId)
  }

  return (
    <button
      onClick={handleShowPrintedImagesModal}
      className="group flex flex-nowrap items-center justify-center font-bold gap-1 text-inherit rounded p-1"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-refresh-ccw-icon lucide-refresh-ccw w-4 h-4 smd:w-5 smd:h-5 5xl:w-7 5xl:h-7"
      >
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M16 16h5v5" />
      </svg>
      <span className="5xl:text-[1em] text-xs smd:text-sm">Đổi ảnh</span>
    </button>
  )
}

type PrintedImageMenuProps = {
  frameId: string
  onClose: () => void
  printedImageURL: string
}

export const TemplateFrameMenu = ({ frameId, onClose, printedImageURL }: PrintedImageMenuProps) => {
  const menuRef = useRef<HTMLDivElement | null>(null)

  return (
    <div
      ref={menuRef}
      className="NAME-menu-section NAME-menu-template-frame STYLE-hide-scrollbar 5xl:text-2xl smd:text-sm smd:mt-2 smd:px-0 px-2 text-sm w-full"
    >
      <h3 className="5xl:text-[1em] smd:text-sm smd:mt-3 text-xs mb-1 font-bold">
        Tùy chỉnh ảnh photobooth
      </h3>
      <div className="s2xl:grid-cols-3 smd:grid-cols-2 sms:grid-cols-4 grid-cols-2 spmd:gap-2 gap-1 grid rounded-md">
        <div className="5xl:h-12 h-8 smd:h-9 mobile-touch cursor-pointer border-2 border-main-cl text-white hover:bg-white hover:text-main-cl flex items-center justify-center bg-main-cl rounded px-1 shadow">
          <ChangePrintedImage frameId={frameId} />
        </div>
        <div className="5xl:h-12 h-8 smd:h-9 cursor-pointer border-2 border-main-cl text-white hover:bg-white hover:text-main-cl flex items-center justify-center bg-main-cl rounded px-1 shadow">
          <GrayscaleControl />
        </div>
        <div className="5xl:h-12 s2xl:col-span-1 col-span-2 flex items-center justify-center h-8 smd:h-9 mobile-touch cursor-pointer border-2 border-main-cl z-30 text-white bg-main-cl rounded hover:bg-white hover:text-main-cl w-full">
          <button
            onClick={onClose}
            className="group flex items-center justify-center h-7 w-full text-inherit rounded p-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-check-icon lucide-check 5xl:w-7 5xl:h-7"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
