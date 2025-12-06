import { useRotateElement } from '@/hooks/element/use-rotate-element'
import { useZoomElement } from '@/hooks/element/use-zoom-element'
import { useDragElement } from '@/hooks/element/use-drag-element'
import { useEffect, useState, useRef, useCallback } from 'react'
import { createInitialConstants } from '@/utils/contants'
import { TElementMountType, TElementVisualBaseState, TPosition } from '@/utils/types/global'
import { useElementLayerStore } from '@/stores/ui/element-layer.store'
import { EInternalEvents, eventEmitter } from '@/utils/events'
import { useEditAreaStore } from '@/stores/ui/edit-area.store'
import { useSnapThresholdRotateElement } from './use-snap-threshold-rotate-element'

type TElementPreviousRelativeProps = {
  relativeOffsetLeft: number
  relativeOffsetTop: number
}

type TInitialParams = Partial<
  TElementVisualBaseState & {
    maxZoom: number
    minZoom: number
    mountType: TElementMountType
  }
>

type TElementControlReturn = {
  // forPinch: {
  //   ref: React.RefObject<HTMLElement | null>
  // }
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
    dragButtonRef: React.RefObject<HTMLDivElement | null>
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
  elementRootRef: React.RefObject<HTMLElement | null>,
  printAreaAllowedRef: React.RefObject<HTMLDivElement | null>,
  containerForElementAbsoluteToRef: React.RefObject<HTMLDivElement | null>,
  initialParams?: TInitialParams
): TElementControlReturn => {
  const {
    position: initialPosition,
    maxZoom,
    minZoom,
    angle: initialAngle = createInitialConstants<number>('ELEMENT_ROTATION'),
    scale: initialZoom = createInitialConstants<number>('ELEMENT_ZOOM'),
    zindex: initialZindex = createInitialConstants<number>('ELEMENT_ZINDEX'),
    mountType,
  } = initialParams || {}
  const [position, setPosition] = useState<TElementVisualBaseState['position']>({
    x: initialPosition?.x || createInitialConstants<number>('ELEMENT_X'),
    y: initialPosition?.y || createInitialConstants<number>('ELEMENT_Y'),
  })

  const edgesMargin: number = 10 // px
  const handleSetElementPosition = (posX: TPosition['x'], posY: TPosition['y']) => {
    const containerForElementAbsoluteTo = containerForElementAbsoluteToRef.current
    const rootElement = elementRootRef.current
    if (!containerForElementAbsoluteTo || !rootElement) return

    // Capture offset BEFORE position changes
    captureElementOffsetBeforeChange()

    if (posX < 0) return
    if (posY < 0) return
    const containerForElementAbsoluteToRect = containerForElementAbsoluteTo.getBoundingClientRect()
    const rootElementRect = rootElement.getBoundingClientRect()
    if (posX > containerForElementAbsoluteToRect.width - rootElementRect.width - edgesMargin) return
    if (posY > containerForElementAbsoluteToRect.height - rootElementRect.height - edgesMargin)
      return
    setPosition({ x: posX, y: posY })
    setTimeout(() => {
      const containerForElementAbsoluteTo = containerForElementAbsoluteToRef.current
      const rootElement = elementRootRef.current
      if (!containerForElementAbsoluteTo || !rootElement) return
      const containerForElementAbsoluteToRect =
        containerForElementAbsoluteTo.getBoundingClientRect()
      const rootElementRect = rootElement.getBoundingClientRect()
      if (
        rootElementRect.left + rootElementRect.width >
        containerForElementAbsoluteToRect.left + containerForElementAbsoluteToRect.width
      ) {
        setPosition((prev) => ({
          ...prev,
          x: containerForElementAbsoluteToRect.width - rootElementRect.width - edgesMargin,
        }))
      }
      if (
        rootElementRect.top + rootElementRect.height >
        containerForElementAbsoluteToRect.top + containerForElementAbsoluteToRect.height
      ) {
        setPosition((prev) => ({
          ...prev,
          y: containerForElementAbsoluteToRect.height - rootElementRect.height - edgesMargin,
        }))
      }
    }, 700)
  }

  const handleSetSinglePosition = (posX?: TPosition['x'], posY?: TPosition['y']) => {
    const containerForElementAbsoluteTo = containerForElementAbsoluteToRef.current
    const rootElement = elementRootRef.current
    if (!containerForElementAbsoluteTo || !rootElement) return
    const containerForElementAbsoluteToRect = containerForElementAbsoluteTo.getBoundingClientRect()
    const rootElementRect = rootElement.getBoundingClientRect()
    if (posX && posX > 0) {
      let parsedValue = posX
      if (posX > containerForElementAbsoluteToRect.width - rootElementRect.width) {
        parsedValue = containerForElementAbsoluteToRect.width - rootElementRect.width - 5
      }
      setPosition((prev) => ({
        ...prev,
        x: parsedValue,
      }))
    } else if (posY && posY > 0) {
      let parsedValue = posY
      if (posY > containerForElementAbsoluteToRect.height - rootElementRect.height) {
        parsedValue = containerForElementAbsoluteToRect.height - rootElementRect.height - 5
      }
      setPosition((prev) => ({
        ...prev,
        y: parsedValue,
      }))
    }
  }

  const elementLayers = useElementLayerStore((s) => s.elementLayers)
  const [scale, setScale] = useState<TElementVisualBaseState['scale']>(initialZoom)
  const [angle, setAngle] = useState<TElementVisualBaseState['angle']>(initialAngle)
  const [zindex, setZindex] = useState<TElementVisualBaseState['zindex']>(initialZindex)
  const scaleFactor = useEditAreaStore((s) => s.editAreaScaleValue)
  // Ref to store previous offset values before visual state changes
  const elementPreviousRelativeProps = useRef<TElementPreviousRelativeProps | null>(null)
  // const { ref: refForPinch } = usePinchElement({
  //   maxScale: maxZoom,
  //   minScale: minZoom,
  //   currentScale: scale,
  //   setCurrentScale: setScale,
  //   currentRotation: angle,
  //   setCurrentRotation: setAngle,
  //   currentPosition: position,
  //   setCurrentPosition: (pos) => {
  //     handleSetElementPosition(pos.x, pos.y)
  //   },
  // })
  const {
    rotateButtonRef,
    containerRef: refForRotate,
    isRotating,
  } = useSnapThresholdRotateElement({
    currentRotation: angle,
    setCurrentRotation: setAngle,
    snapBreakThreshold: createInitialConstants<number>('ELEMENT_ROTATION_SNAP_BREAK_THRESHOLD'),
    snapThreshold: createInitialConstants<number>('ELEMENT_ROTATION_SNAP_THRESHOLD'),
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
  const handleSetElementPositionCallback = useCallback((pos: TPosition) => {
    handleSetElementPosition(pos.x, pos.y)
  }, [])
  const { containerRef: refForDrag, dragButtonRef } = useDragElement({
    disabled: isRotating || isZooming,
    currentPosition: position,
    scaleFactor,
    setCurrentPosition: handleSetElementPositionCallback,
    postFunctionDrag: () => {
      const element = elementRootRef.current
      if (!element) return
      const container = containerForElementAbsoluteToRef.current
      if (!container) return
    },
  })

  const validateInputValueAndSet = (
    value: string | number | [TPosition['x'], TPosition['y']],
    type: 'posX' | 'posY' | 'scale' | 'angle' | 'zindex' | 'posXY'
  ) => {
    // Capture offset before any visual state change
    captureElementOffsetBeforeChange()

    switch (type) {
      case 'posXY':
        handleSetElementPosition((value as Array<number>)[0], (value as Array<number>)[1])
        break
      case 'posX':
        handleSetSinglePosition(value as number, undefined)
        break
      case 'posY':
        handleSetSinglePosition(undefined, value as number)
        break
      case 'scale':
        let parsedScale = value as number
        if (minZoom) {
          if ((value as number) < minZoom) {
            parsedScale = minZoom
          }
          setScale(parsedScale)
        }
        if (maxZoom) {
          if ((value as number) > maxZoom) {
            parsedScale = maxZoom
          }
          setScale(parsedScale)
        }
        break
      case 'angle':
        setAngle(value as number)
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
    setZindex((elementLayerIndex + 1) * createInitialConstants<number>('ELEMENT_ZINDEX_STEP') + 1)
  }

  const setupVisualData = () => {
    if (mountType !== 'from-saved') return
    // Normalise saved scale: some saved data may store percentage (e.g. 100)
    let parsedScale = typeof initialZoom === 'number' ? initialZoom : 1
    if (parsedScale <= 0) parsedScale = 1
    // If value looks like percent (very large > 10), convert to ratio
    if (parsedScale > 10) parsedScale = parsedScale / 100
    // Clamp to min/max zoom if provided
    if (minZoom && parsedScale < minZoom) parsedScale = minZoom
    if (maxZoom && parsedScale > maxZoom) parsedScale = maxZoom
    // debug
    handleSetElementState(
      initialPosition?.x,
      initialPosition?.y,
      parsedScale,
      initialAngle,
      initialZindex
    )
  }

  const stayElementVisualOnAllowedPrintArea = () => {
    const elementPreOffset = elementPreviousRelativeProps.current
    if (!elementPreOffset) return
    const allowedPrintArea = printAreaAllowedRef.current
    const element = elementRootRef.current
    if (!allowedPrintArea || !element) return
    const allowedPrintAreaLeft = allowedPrintArea.offsetLeft
    const allowedPrintAreaTop = allowedPrintArea.offsetTop
    const allowedPrintAreaRect = allowedPrintArea.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()
    handleSetElementPosition(
      Math.min(
        allowedPrintAreaLeft + elementPreOffset.relativeOffsetLeft,
        allowedPrintAreaLeft + allowedPrintAreaRect.width - elementRect.width - 4
      ),
      Math.min(
        allowedPrintAreaTop + elementPreOffset.relativeOffsetTop,
        allowedPrintAreaTop + allowedPrintAreaRect.height - elementRect.height - 4
      )
    )
  }

  const captureElementOffsetBeforeChange = () => {
    const root = elementRootRef.current
    if (!root) return
    const allowedPrintAreaLeft = printAreaAllowedRef.current?.offsetLeft
    const allowedPrintAreaTop = printAreaAllowedRef.current?.offsetTop
    if (!allowedPrintAreaLeft || !allowedPrintAreaTop) return

    const offsetLeft = root.offsetLeft
    const offsetTop = root.offsetTop

    // Save to ref for immediate access
    elementPreviousRelativeProps.current = {
      relativeOffsetLeft: offsetLeft - allowedPrintAreaLeft,
      relativeOffsetTop: offsetTop - allowedPrintAreaTop,
    }
  }

  useEffect(() => {
    captureElementOffsetBeforeChange()
  }, [position.x, position.y, angle, scale, zindex])

  useEffect(() => {
    eventEmitter.on(
      EInternalEvents.ELEMENTS_OUT_OF_BOUNDS_CHANGED,
      stayElementVisualOnAllowedPrintArea
    )
    return () => {
      eventEmitter.off(
        EInternalEvents.ELEMENTS_OUT_OF_BOUNDS_CHANGED,
        stayElementVisualOnAllowedPrintArea
      )
    }
  }, [])

  useEffect(() => {
    // Setup ResizeObserver to watch for print container size changes
    const container = containerForElementAbsoluteToRef.current
    if (!container) return
    const containerObserver = new ResizeObserver((entries) => {
      stayElementVisualOnAllowedPrintArea()
    })
    containerObserver.observe(container)
    eventEmitter.on
    return () => {
      containerObserver.unobserve(container)
    }
  }, [elementId])

  useEffect(() => {
    onElementLayersChange()
  }, [elementLayers])

  useEffect(() => {
    setupVisualData()
  }, [mountType, initialPosition?.x, initialPosition?.y, initialAngle, initialZoom, initialZindex])

  return {
    // forPinch: {
    //   ref: refForPinch,
    // },
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
      dragButtonRef,
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
