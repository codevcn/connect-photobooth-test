import { cn } from '@/configs/ui/tailwind-utils'
import { useRef, useEffect, useState } from 'react'

type TCustomScrollbarProps = {
  thumbMinHeight?: number
  children: React.ReactNode
  classNames?: {
    container?: string
    content?: string
  }
  thumbMinWidth?: number
  showScrollbar?: boolean
  dataToRerender?: any
  ids?: {
    content?: string
  }
}

export function CustomScrollbar({
  thumbMinHeight = 20,
  children,
  classNames,
  thumbMinWidth = 20,
  showScrollbar = true,
  dataToRerender,
  ids,
}: TCustomScrollbarProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const [thumbWidth, setThumbWidth] = useState(0)
  const [thumbLeft, setThumbLeft] = useState(0)
  const [hasScroll, setHasScroll] = useState(false)

  const update = () => {
    const el = containerRef.current
    if (!el) return

    const totalWidth = el.scrollWidth
    const visibleWidth = el.clientWidth

    const canScroll = totalWidth > visibleWidth
    setHasScroll(canScroll)

    if (!canScroll) {
      setThumbWidth(0)
      setThumbLeft(0)
      return
    }

    const ratio = visibleWidth / totalWidth
    const w = Math.max(visibleWidth * ratio, thumbMinWidth)

    setThumbWidth(w)

    const maxThumbLeft = visibleWidth - w
    const scrollRatio = el.scrollLeft / (totalWidth - visibleWidth)
    setThumbLeft(maxThumbLeft * scrollRatio)
  }

  useEffect(() => {
    update()
    const el = containerRef.current
    if (!el) return

    el.addEventListener('scroll', update)
    window.addEventListener('resize', update)

    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  useEffect(() => {
    update()
  }, [dataToRerender])

  return (
    <div className={cn('relative', classNames?.container)}>
      {/* Scrollable Content */}
      <div
        ref={containerRef}
        id={ids?.content}
        className={cn('w-full pb-2 overflow-x-auto no-scrollbar', classNames?.content)}
      >
        {children}
      </div>

      {/* Scrollbar Track (ẩn nếu không có scroll) */}
      {showScrollbar && hasScroll && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-black/10 rounded-md">
          <div
            style={{
              left: thumbLeft,
              width: thumbWidth,
            }}
            className="absolute bottom-0 h-full bg-gray-400 rounded-md"
          />
        </div>
      )}
    </div>
  )
}
