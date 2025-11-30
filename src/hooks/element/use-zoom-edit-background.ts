import { createInitialConstants } from '@/utils/contants'
import { TPosition } from '@/utils/types/global'
import { useRef, useEffect, SetStateAction } from 'react'

type TUseUniversalZoomOptions = {} & Partial<{
  minScale: number
  maxScale: number
  enablePan: boolean
  enableZoom: boolean
  enableWheelZoom: boolean
}>

type TUseUniversalZoomReturn = {
  refForZoom: React.RefObject<HTMLDivElement | null>
  currentScale: number
  currentPosition: TPosition
  reset: () => void
}

const preventEventForEdit = (e: Event): boolean => {
  return !!(e.target as HTMLElement).closest('.NAME-print-area-allowed')
}

export function useUniversalZoomForEditBackground(
  options: TUseUniversalZoomOptions,
  setCurrentScale: React.Dispatch<SetStateAction<number>>,
  setCurrentPosition: React.Dispatch<SetStateAction<TPosition>>,
  currentScale: number,
  currentPosition: TPosition
): TUseUniversalZoomReturn {
  const {
    minScale = createInitialConstants<number>('EDIT_BACKGROUND_MIN_ZOOM'),
    maxScale = createInitialConstants<number>('EDIT_BACKGROUND_MAX_ZOOM'),
    enablePan = true,
    enableZoom = true,
    enableWheelZoom = true,
  } = options

  const ref = useRef<HTMLDivElement | null>(null)

  const isDragging = useRef(false)
  const lastMouse = useRef<TPosition>({ x: 0, y: 0 })

  const lastTouchDistance = useRef(0)
  const lastTouchCenter = useRef<TPosition>({ x: 0, y: 0 })

  // ============================
  // HELPERS
  // ============================
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(v, max))

  const getTouchCenter = (t1: Touch, t2: Touch): TPosition => ({
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2,
  })

  const getTouchDistance = (t1: Touch, t2: Touch): number =>
    Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)

  // ============================
  // WHEEL ZOOM (PC)
  // ============================
  const handleWheel = (e: WheelEvent) => {
    // Không zoom nếu con trỏ nằm trong vùng in cho phép
    if (preventEventForEdit(e)) return

    if (!enableZoom || !enableWheelZoom) return
    if (!ref.current) return

    e.preventDefault()

    const rect = ref.current.getBoundingClientRect()
    const mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top }

    const factor = e.deltaY < 0 ? 1.1 : 0.9
    const newScale = clamp(currentScale * factor, minScale, maxScale)

    // giữ điểm zoom đúng tâm chuột
    setCurrentPosition({
      x: mouse.x - ((mouse.x - currentPosition.x) * newScale) / currentScale,
      y: mouse.y - ((mouse.y - currentPosition.y) * newScale) / currentScale,
    })

    setCurrentScale(newScale)
  }

  // ============================
  // MOUSE PAN (PC)
  // ============================
  const handleMouseDown = (e: MouseEvent) => {
    if (preventEventForEdit(e)) return

    if (!enablePan) return
    // Không kích hoạt pan nếu người dùng thao tác trên vùng in
    isDragging.current = true
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (preventEventForEdit(e)) return
    if (!isDragging.current || !enablePan) return

    const dx = e.clientX - lastMouse.current.x
    const dy = e.clientY - lastMouse.current.y

    setCurrentPosition((p) => ({ x: p.x + dx, y: p.y + dy }))
    lastMouse.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  // ============================
  // TOUCH HANDLING (MOBILE)
  // ============================
  const handleTouchStart = (e: TouchEvent) => {
    // Không kích hoạt pan nếu chạm trong vùng in
    if (preventEventForEdit(e)) return
    if (e.touches.length === 1) {
      // one finger = pan
      lastMouse.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
      isDragging.current = true
    }

    if (e.touches.length === 2 && enableZoom) {
      const [t1, t2] = e.touches
      lastTouchDistance.current = getTouchDistance(t1, t2)
      lastTouchCenter.current = getTouchCenter(t1, t2)
      isDragging.current = false
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (preventEventForEdit(e)) return
    if (e.touches.length === 1 && enablePan) {
      // finger drag
      e.preventDefault()
      const t = e.touches[0]

      const dx = t.clientX - lastMouse.current.x
      const dy = t.clientY - lastMouse.current.y

      setCurrentPosition((p) => ({ x: p.x + dx, y: p.y + dy }))
      lastMouse.current = { x: t.clientX, y: t.clientY }
    }

    if (e.touches.length === 2 && enableZoom) {
      e.preventDefault()

      const [t1, t2] = e.touches
      const newDistance = getTouchDistance(t1, t2)
      const center = getTouchCenter(t1, t2)

      const factor = newDistance / lastTouchDistance.current
      const newScale = clamp(currentScale * factor, minScale, maxScale)

      const rect = ref.current!.getBoundingClientRect()
      const cx = center.x - rect.left
      const cy = center.y - rect.top

      setCurrentPosition({
        x: cx - ((cx - currentPosition.x) * newScale) / currentScale,
        y: cy - ((cy - currentPosition.y) * newScale) / currentScale,
      })

      setCurrentScale(newScale)

      lastTouchCenter.current = center
      lastTouchDistance.current = newDistance
    }
  }

  const handleTouchEnd = () => {
    isDragging.current = false
  }

  // ============================
  // REGISTER EVENTS
  // ============================
  useEffect(() => {
    const el = ref.current
    if (!el) return

    el.style.touchAction = 'none'

    // wheel
    el.addEventListener('wheel', handleWheel, { passive: false })

    // mouse
    el.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    // touch
    el.addEventListener('touchstart', handleTouchStart)
    el.addEventListener('touchmove', handleTouchMove)
    el.addEventListener('touchend', handleTouchEnd)

    return () => {
      el.removeEventListener('wheel', handleWheel)
      el.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)

      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchmove', handleTouchMove)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  }, [currentScale, currentPosition])

  return {
    refForZoom: ref,
    currentScale,
    currentPosition,
    reset: () => {
      setCurrentScale(1)
      setCurrentPosition({ x: 0, y: 0 })
    },
  }
}
