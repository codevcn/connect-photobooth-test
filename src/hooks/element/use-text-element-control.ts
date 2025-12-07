import { useElementControl } from '@/hooks/element/use-element-control'
import { useEffect, useState } from 'react'
import { roundZooming } from '@/utils/helpers'
import { createInitialConstants } from '@/utils/contants'
import { TElementMountType, TTextVisualState } from '@/utils/types/global'
import { useEditAreaStore } from '@/stores/ui/edit-area.store'

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
  state: Omit<TTextVisualState, 'id'>
  handleSetElementState: (
    posX?: number,
    posY?: number,
    scale?: number,
    angle?: number,
    zindex?: number,
    fontSize?: number,
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
  initialParams?: TInitialTextParams
): TTextElementControlReturn => {
  const {
    position: { x: initialPosX, y: initialPosY } = {
      x: createInitialConstants<number>('ELEMENT_X'),
      y: createInitialConstants<number>('ELEMENT_Y'),
    },
    fontSize: initialFontSize = createInitialConstants<number>('ELEMENT_TEXT_FONT_SIZE'),
    maxFontSize,
    minFontSize,
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
  const [fontSize, setFontSize] = useState<TTextVisualState['fontSize']>(initialFontSize)
  const [textColor, setTextColor] = useState<TTextVisualState['textColor']>(initialColor)
  const [fontFamily, setFontFamily] = useState<TTextVisualState['fontFamily']>(initialFontFamily)
  const [fontWeight, setFontWeight] = useState<TTextVisualState['fontWeight']>(initialFontWeight)

  const convertZoomValueToFontSize = (zoomValue: number): number => {
    return roundZooming(zoomValue * createInitialConstants<number>('ELEMENT_TEXT_FONT_SIZE'))
  }

  const convertFontSizeToZoomValue = (fontSize: number): number => {
    return (
      ((fontSize / createInitialConstants<number>('ELEMENT_TEXT_FONT_SIZE')).toFixed(
        2
      ) as unknown as number) * 1
    )
  }

  const handleSetFontSize = (fontSizeValue?: number, scaleValue?: number) => {
    let adjustedFontSize
    if (scaleValue) {
      adjustedFontSize = convertZoomValueToFontSize(scaleValue)
    } else if (fontSizeValue) {
      adjustedFontSize = fontSizeValue
    } else return // nếu không tham số nào có giá trị => dừng lại
    if (minFontSize && minFontSize > adjustedFontSize) {
      adjustedFontSize = minFontSize
    }
    if (maxFontSize && maxFontSize < adjustedFontSize) {
      adjustedFontSize = maxFontSize
    }
    setFontSize(adjustedFontSize)
  }

  const validateInputValueAndSet = (
    value: string | number,
    type: 'fontSize' | 'textColor' | 'content' | 'fontFamily' | 'fontWeight'
  ) => {
    let parsedValue: number | string = value
    switch (type) {
      case 'fontSize':
        handleSetFontSize(parsedValue as number)
        break
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
    fontSize?: number,
    textColor?: string,
    content?: string,
    fontFamily?: string,
    fontWeight?: number
  ) => {
    baseHandleSetElementState(posX, posY, undefined, angle, zindex)
    if (fontSize) {
      validateInputValueAndSet(fontSize, 'fontSize')
      baseHandleSetElementState(undefined, undefined, convertFontSizeToZoomValue(fontSize))
    }
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
        initialFontSize,
        initialColor,
        initialContent,
        initialFontFamily,
        initialFontWeight
      )
    }
  }

  useEffect(() => {
    handleSetFontSize(undefined, baseState.scale)
  }, [baseState.scale])

  useEffect(() => {
    setupVisualData()
  }, [initialFontSize, initialColor, initialContent, initialFontFamily, initialFontWeight])

  return {
    // forPinch,
    forDrag,
    forRotate,
    forZoom,
    handleSetElementState,
    state: {
      fontSize,
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
