import { TTemplateFrame, TTemplateType } from '@/utils/types/global'
import { PlacedImage } from './PlacedImage'
import type React from 'react'
import { cn } from '@/configs/ui/tailwind-utils'
import { styleFrameByTemplateType } from '@/configs/print-template/templates-helpers'
import { useRef, useState } from 'react'
import { useEditedElementStore } from '@/stores/element/element.store'

type TAddImageIconProps = {} & Partial<{
  classNames: Partial<{
    plusIconWrapper: string
  }>
  styles: Partial<{
    container: React.CSSProperties
    plusIconWrapper: React.CSSProperties
  }>
}>

export const AddImageIcon = ({ styles, classNames }: TAddImageIconProps) => {
  return (
    <div
      style={styles?.plusIconWrapper}
      className={cn(
        'NAME-plus-icon-wrapper flex items-center justify-center text-white h-full w-full bg-gray-400/90',
        classNames?.plusIconWrapper
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-plus-icon lucide-plus"
      >
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </svg>
    </div>
  )
}

type TemplateFrameProps = {
  templateFrame: TTemplateFrame
  templateType: TTemplateType
} & Partial<{
  plusIconReplacer: React.JSX.Element
  styles: Partial<{
    container: React.CSSProperties
    plusIconWrapper: React.CSSProperties
  }>
  classNames: Partial<{
    container: string
    plusIconWrapper: string
  }>
  onClickFrame: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, frameId: string) => void
  displayPlusIcon: boolean
  registerChild?: (index: number, el: HTMLImageElement | null) => void
  childIndex?: number
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>, frameId: string) => void
}>

export const TemplateFrame = ({
  templateFrame,
  templateType,
  plusIconReplacer,
  styles,
  classNames,
  onClickFrame,
  displayPlusIcon = true,
  registerChild,
  childIndex,
  onPointerDown,
}: TemplateFrameProps) => {
  const selectedElement = useEditedElementStore((s) => s.selectedElement)
  return (
    <div
      onPointerDown={onPointerDown ? (e) => onPointerDown(e, templateFrame.id) : undefined}
      style={{
        ...styles?.container,
        ...styleFrameByTemplateType(templateType, templateFrame.index),
      }}
      className={cn(
        'NAME-template-frame touch-none relative flex justify-center items-center overflow-hidden h-full w-full border border-gray-600 border-dashed',
        classNames?.container,
        selectedElement?.elementId === templateFrame.id && 'outline-4 z-50 outline-orange-600',
        templateFrame.placedImage && 'bg-transparent'
      )}
      onClick={onClickFrame ? (e) => onClickFrame(e, templateFrame.id) : undefined}
    >
      {templateFrame.placedImage ? (
        <PlacedImage
          placedImage={templateFrame.placedImage}
          templateType={templateType}
          frameIndex={templateFrame.index}
          frame={templateFrame}
          registerChild={registerChild}
          childIndex={childIndex}
        />
      ) : (
        displayPlusIcon &&
        (plusIconReplacer || <AddImageIcon styles={styles} classNames={classNames} />)
      )}
    </div>
  )
}
