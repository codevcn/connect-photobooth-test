import { useRotateElement } from '@/hooks/element/use-rotate-element'
import { usePinchElement } from '@/hooks/element/use-pinch-element'
import { useZoomElement } from '@/hooks/element/use-zoom-element'
import { useDragElement } from '@/hooks/element/use-drag-element'
import { useEffect, useState } from 'react'
import { getInitialContants } from '@/utils/contants'
import { TElementVisualBaseState } from '@/utils/types/global'
import { useElementLayerStore } from '@/stores/ui/element-layer.store'

type TInitialParams = Partial<
  TElementVisualBaseState & {
    maxZoom: number
    minZoom: number
  }
>

type TElementControlReturn = {
  forPinch: {
    ref: React.RefObject<HTMLElement | null>
  }
  forRotate: {
    ref: React.RefObject<HTMLElement | null>
    isRotating: boolean
    rotateButtonRef: React.RefObject<HTMLButtonElement | null>
  }
  forZoom: {
    ref: React.RefObject<HTMLElement | null>
    isZooming: boolean
    zoomButtonRef: React.RefObject<HTMLButtonElement | null>
  }
  forDrag: {
    ref: React.RefObject<HTMLElement | null>
  }
  state: TElementVisualBaseState
  handleSetElementState: (
    posX?: number,
    posY?: number,
    scale?: number,
    angle?: number,
    zindex?: number
  ) => void
}

export const useElementControl = (
  elementId: string,
  initialParams?: TInitialParams
): TElementControlReturn => {
  const {
    position: { x: initialPosX, y: initialPosY } = {
      x: getInitialContants<number>('ELEMENT_X'),
      y: getInitialContants<number>('ELEMENT_Y'),
    },
    maxZoom,
    minZoom,
    angle: initialAngle = getInitialContants<number>('ELEMENT_ROTATION'),
    scale: initialZoom = getInitialContants<number>('ELEMENT_ZOOM'),
    zindex: initialZindex = getInitialContants<number>('ELEMENT_ZINDEX'),
  } = initialParams || {}
  const elementLayers = useElementLayerStore((s) => s.elementLayers)
  const [position, setPosition] = useState<TElementVisualBaseState['position']>({
    x: initialPosX !== undefined ? initialPosX : getInitialContants<number>('ELEMENT_X'),
    y: initialPosY !== undefined ? initialPosY : getInitialContants<number>('ELEMENT_Y'),
  })
  const [scale, setScale] = useState<TElementVisualBaseState['scale']>(initialZoom)
  const [angle, setAngle] = useState<TElementVisualBaseState['angle']>(initialAngle)
  const [zindex, setZindex] = useState<TElementVisualBaseState['zindex']>(initialZindex)
  const { ref: refForPinch } = usePinchElement({
    maxScale: maxZoom,
    minScale: minZoom,
    currentScale: scale,
    setCurrentScale: setScale,
    currentRotation: angle,
    setCurrentRotation: setAngle,
    currentPosition: position,
    setCurrentPosition: setPosition,
  })
  const {
    rotateButtonRef,
    containerRef: refForRotate,
    isRotating,
  } = useRotateElement({
    currentRotation: angle,
    setCurrentRotation: setAngle,
  })
  const {
    zoomButtonRef,
    containerRef: refForZoom,
    isZooming,
  } = useZoomElement({
    maxZoom: maxZoom,
    minZoom: minZoom,
    currentZoom: scale,
    setCurrentZoom: setScale,
  })
  const { ref: refForDrag } = useDragElement({
    disabled: isRotating || isZooming,
    currentPosition: position,
    setCurrentPosition: setPosition,
  })

  const validateInputValueAndSet = (
    value: string | number,
    type: 'posX' | 'posY' | 'scale' | 'angle' | 'zindex'
  ) => {
    let parsedValue: number | string = value
    switch (type) {
      case 'posX':
        setPosition((prev) => ({ ...prev, x: value as number }))
        break
      case 'posY':
        setPosition((prev) => ({ ...prev, y: value as number }))
        break
      case 'scale':
        if (minZoom) {
          if ((value as number) < minZoom) {
            parsedValue = minZoom
          }
        }
        if (maxZoom) {
          if ((value as number) > maxZoom) {
            parsedValue = maxZoom
          }
        }
        setScale(parsedValue as number)
        break
      case 'angle':
        setAngle(parsedValue as number)
        break
    }
  }

  const handleSetElementState = (
    posX?: number,
    posY?: number,
    scale?: number,
    angle?: number,
    zindex?: number
  ) => {
    if (posX || posX === 0) {
      validateInputValueAndSet(posX, 'posX')
    }
    if (posY || posY === 0) {
      validateInputValueAndSet(posY, 'posY')
    }
    if (scale) {
      validateInputValueAndSet(scale, 'scale')
    }
    if (angle || angle === 0) {
      validateInputValueAndSet(angle, 'angle')
    }
    if (zindex) {
      useElementLayerStore.getState().updateElementLayerIndex(elementId, zindex)
    }
  }

  const onElementLayersChange = () => {
    const elementLayerIndex = elementLayers.findIndex((layer) => layer.elementId === elementId)
    if (elementLayerIndex < 0) return
    // element layer zindex starts from 11
    setZindex((elementLayerIndex + 1) * getInitialContants<number>('ELEMENT_ZINDEX_STEP') + 1)
  }

  useEffect(() => {
    onElementLayersChange()
  }, [elementLayers])

  return {
    forPinch: {
      ref: refForPinch,
    },
    forRotate: {
      ref: refForRotate,
      isRotating,
      rotateButtonRef,
    },
    forZoom: {
      ref: refForZoom,
      isZooming,
      zoomButtonRef,
    },
    forDrag: {
      ref: refForDrag,
    },
    handleSetElementState,
    state: {
      position,
      angle,
      scale,
      zindex,
    },
  }
}
