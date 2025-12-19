import { useElementControl } from '@/hooks/element/use-element-control'
import { useEffect, useState } from 'react'
import { createInitialConstants } from '@/utils/contants'
import { TElementMountType, TTextVisualState } from '@/utils/types/global'
import { useEditAreaStore } from '@/stores/ui/edit-area.store'
import { calculateElementClipPolygon } from '@/pages/edit/elements/clip-element-helper'
import { useEditedElementStore } from '@/stores/element/element.store'

type TInitialTextParams = Partial<
  TTextVisualState & {
    maxFontSize: number
    minFontSize: number
    mountType: TElementMountType
  }
>

type TTextElementControlReturn = {
  // forPinch: {
  //   ref: React.RefObject<HTMLElement | null>
  // }
  forRotate: {
    ref: React.RefObject<HTMLElement | null>
    isRotating: boolean
    rotateButtonRef: React.RefObject<HTMLElement | null>
  }
  forZoom: {
    ref: React.RefObject<HTMLElement | null>
    isZooming: boolean
    zoomButtonRef: React.RefObject<HTMLElement | null>
  }
  forDrag: {
    ref: React.RefObject<HTMLElement | null>
    dragButtonRef: React.RefObject<HTMLElement | null>
    dragButtonSelfElementRef: React.RefObject<HTMLElement | null>
  }
  state: Omit<TTextVisualState, 'id'>
  handleSetElementState: (
    posX?: number,
    posY?: number,
    scale?: number,
    angle?: number,
    zindex?: number,
    textColor?: string,
    content?: string,
    fontFamily?: string,
    fontWeight?: number
  ) => void
}

export const useTextElementControl = (
  elementId: string,
  elementRootRef: React.RefObject<HTMLElement | null>,
  printAreaAllowedRef: React.RefObject<HTMLDivElement | null>,
  containerForElementAbsoluteToRef: React.RefObject<HTMLDivElement | null>,
  elementControlRef: React.RefObject<{ todo: (param: any) => void }> | null,
  initialParams?: TInitialTextParams
): TTextElementControlReturn => {
  const {
    position: { x: initialPosX, y: initialPosY } = {
      x: createInitialConstants<number>('ELEMENT_X'),
      y: createInitialConstants<number>('ELEMENT_Y'),
    },
    textColor: initialColor = createInitialConstants<string>('ELEMENT_TEXT_COLOR'),
    content: initialContent = '',
    fontFamily: initialFontFamily = createInitialConstants<string>('ELEMENT_TEXT_FONT_FAMILY'),
    fontWeight: initialFontWeight = createInitialConstants<number>('ELEMENT_TEXT_FONT_WEIGHT'),
    angle: initialAngle = createInitialConstants<number>('ELEMENT_ROTATION'),
    zindex: initialZindex = createInitialConstants<number>('ELEMENT_ZINDEX'),
    scale: initialZoom = createInitialConstants<number>('ELEMENT_ZOOM'),
    mountType,
  } = initialParams || {}
  const scaleFactor = useEditAreaStore((s) => s.editAreaScaleValue)

  const {
    // forPinch,
    forDrag,
    forRotate,
    forZoom,
    state: baseState,
    handleSetElementState: baseHandleSetElementState,
  } = useElementControl(
    elementId,
    elementRootRef,
    printAreaAllowedRef,
    containerForElementAbsoluteToRef,
    'text',
    {
      position: { x: initialPosX, y: initialPosY },
      angle: initialAngle,
      zindex: initialZindex,
      mountType: mountType,
      scale: initialZoom,
    }
  )

  const [content, setContent] = useState<TTextVisualState['content']>(initialContent)
  const [textColor, setTextColor] = useState<TTextVisualState['textColor']>(initialColor)
  const [fontFamily, setFontFamily] = useState<TTextVisualState['fontFamily']>(initialFontFamily)
  const [fontWeight, setFontWeight] = useState<TTextVisualState['fontWeight']>(initialFontWeight)

  const validateInputValueAndSet = (
    value: string | number,
    type: 'textColor' | 'content' | 'fontFamily' | 'fontWeight'
  ) => {
    let parsedValue: number | string = value
    switch (type) {
      case 'fontWeight':
        setFontWeight(parsedValue as number)
        break
      case 'textColor':
        setTextColor(parsedValue as string)
        break
      case 'content':
        setContent(parsedValue as string)
        break
      case 'fontFamily':
        setFontFamily(parsedValue as string)
        break
    }
  }

  const handleSetElementState = (
    posX?: number,
    posY?: number,
    scale?: number,
    angle?: number,
    zindex?: number,
    textColor?: string,
    content?: string,
    fontFamily?: string,
    fontWeight?: number
  ) => {
    baseHandleSetElementState(posX, posY, undefined, angle, zindex)
    if (textColor) {
      validateInputValueAndSet(textColor, 'textColor')
    }
    if (fontFamily) {
      validateInputValueAndSet(fontFamily, 'fontFamily')
    }
    if (fontWeight) {
      validateInputValueAndSet(fontWeight, 'fontWeight')
    }
    if (content) {
      validateInputValueAndSet(content, 'content')
    }
  }

  const setupVisualData = () => {
    if (mountType === 'from-saved') {
      handleSetElementState(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        initialColor,
        initialContent,
        initialFontFamily,
        initialFontWeight
      )
    }
  }

  useEffect(() => {
    setupVisualData()
  }, [initialColor, initialContent, initialFontFamily, initialFontWeight])

  // Update clip polygon when position, angle, or fontSize changes
  const updateClipPolygon = () => {
    const element = elementRootRef.current
    const allowedArea = printAreaAllowedRef.current
    if (!element || !allowedArea) return
    useEditedElementStore
      .getState()
      .setElementInClipList(
        elementId,
        calculateElementClipPolygon(element, allowedArea, scaleFactor)
      )
  }

  useEffect(() => {
    elementRootRef.current?.style.setProperty('width', 'auto')
    updateClipPolygon()
  }, [content])

  useEffect(() => {
    updateClipPolygon()
  }, [
    baseState.position.x,
    baseState.position.y,
    baseState.angle,
    baseState.scale,
    elementId,
    scaleFactor,
  ])

  return {
    // forPinch,
    forDrag,
    forRotate,
    forZoom,
    handleSetElementState,
    state: {
      textColor,
      content,
      fontFamily,
      fontWeight,
      angle: baseState.angle,
      position: baseState.position,
      zindex: baseState.zindex,
      scale: baseState.scale,
    },
  }
}
