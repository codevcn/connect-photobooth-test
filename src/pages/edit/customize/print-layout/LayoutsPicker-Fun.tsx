import { TPrintedImage } from '@/utils/types/global'
import React, { useEffect, useMemo, useRef } from 'react'
import { useEditedElementStore } from '@/stores/element/element.store'
import { useLayoutStore } from '@/stores/ui/print-layout.store'
import { TLayoutSlotConfig, TLayoutType, TPrintLayout } from '@/utils/types/print-layout'

type TAddImageIconProps = {}

export const AddImageIcon = ({}: TAddImageIconProps) => {
  return (
    <div className="NAME-plus-icon-wrapper flex items-center justify-center text-white h-full w-full bg-gray-400/90">
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
  slotConfig: TLayoutSlotConfig
  layoutType: TLayoutType
  isLayoutPicked?: boolean
}

export const Slot = ({ slotConfig, isLayoutPicked, layoutType }: TemplateFrameProps) => {
  const initStyle = (): React.CSSProperties => {
    if (layoutType === '2-horizontal-square') {
      return { ...slotConfig.style, height: '100%' }
    } else if (layoutType === '2-vertical-square') {
      return { ...slotConfig.style, width: '100%' }
    } else if (layoutType === '6-square') {
      return {}
    }
    return { ...slotConfig.style, height: '100%', width: '100%' }
  }

  const initIconStyle = (): string => {
    if (layoutType === '6-square') {
      return 'w-4 h-4'
    }
    return 'w-6 h-6'
  }

  return (
    <div
      className={`flex justify-center items-center w-full h-full ${
        layoutType === '6-square' ? 'border border-gray-600 border-dashed' : ''
      }`}
    >
      <div
        style={initStyle()}
        className={`${layoutType === '6-square' ? '' : 'border border-gray-600 border-dashed'} ${
          isLayoutPicked ? 'border-main-cl' : ''
        } NAME-layout-slot relative flex justify-center items-center overflow-hidden aspect-square`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`lucide lucide-image-icon lucide-image min-h-4 min-w-4 ${initIconStyle()} lg:w-8 lg:h-8 p-0.5 ${
            isLayoutPicked ? 'text-main-cl' : 'text-gray-500'
          }`}
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      </div>
    </div>
  )
}

type TLayoutsPickerProps = {
  printedImages: TPrintedImage[]
}

export const LayoutsPicker_Fun = ({ printedImages }: TLayoutsPickerProps) => {
  const allLayouts = useLayoutStore((s) => s.allLayouts)
  const pickedLayout = useLayoutStore((s) => s.pickedLayout)
  const layoutMode = useLayoutStore((s) => s.layoutMode)
  const containerRef = useRef<HTMLDivElement>(null)

  const availableLayouts = useMemo(() => {
    return allLayouts.filter((layout) => {
      return (
        layout.layoutType === 'full' ||
        layout.layoutType === '2-horizontal-square' ||
        layout.layoutType === '2-vertical-square' ||
        layout.layoutType === '4-square' ||
        layout.layoutType === '6-square'
      )
    })
  }, [allLayouts])

  const originalFrameImage = useMemo<TPrintedImage>(() => {
    return printedImages.find((img) => img.isOriginalImage)!
  }, [printedImages])

  const handlePickLayout = (layout: TPrintLayout) => {
    useLayoutStore.getState().pickLayout({ ...layout, mountType: 'picked' })
    useEditedElementStore.getState().resetData()
  }

  const handlePickNoLayout = () => {
    useLayoutStore.getState().pickNoLayout()
  }

  const handlePickFrameLayout = () => {
    useLayoutStore.getState().pickFrameLayout(originalFrameImage)
    useEditedElementStore.getState().resetData()
  }

  const findLayoutIndex = () => {
    const index = availableLayouts.findIndex((layout) => layout.id === pickedLayout?.id)
    return index >= 0 ? index + 1 : 0
  }

  useEffect(() => {
    const layouts = containerRef.current?.querySelectorAll<HTMLDivElement>('.NAME-fix-aspect')
    for (const layout of layouts || []) {
      const layoutRect = layout.getBoundingClientRect()
      layout.style.height = `${layoutRect.height}px`
      layout.style.width = `${layoutRect.width}px`
    }
  }, [allLayouts])

  return (
    <div ref={containerRef} className="w-full relative">
      <div className="w-full flex justify-between pr-2">
        <h3 className="5xl:text-[1.5em] smd:text-base text-xs mb-1 font-bold text-gray-800">
          Chọn layout
        </h3>
        <div className="bg-white z-40 rounded py-0.5 px-1 text-xs text-gray-600 shadow-md -translate-y-1">
          {findLayoutIndex()}
          <span>/</span>
          {availableLayouts.length}
        </div>
      </div>
      <div className="smd:grid-cols-3 smd:overflow-x-hidden smd:grid-flow-row py-1 grid-rows-1 grid-flow-col overflow-x-auto grid-flow grid gap-2 w-full gallery-scroll">
        <div
          onClick={handlePickNoLayout}
          className={`NAME-fix-aspect flex items-center justify-center h-16 w-16 border border-gray-300 rounded bg-white mobile-touch cursor-pointer transition ${
            layoutMode === 'no-layout' ? 'border-main-cl' : ''
          }`}
        >
          <div className="NAME-slots-displayer p-0.5 h-full w-full">
            <div
              className={`NAME-fix-aspect relative flex justify-center items-center overflow-hidden h-full w-full border border-gray-600 border-dashed ${
                layoutMode === 'no-layout' ? 'border-main-cl text-main-cl' : 'text-gray-500'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-circle-x-icon lucide-circle-x text-inherit h-0 w-0 smd:w-6 smd:h-6 5xl:w-12 5xl:h-12"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
              </svg>
              <p className="5xl:text-[1.3em] 5xl:p-1 5xl:font-bold text-inherit text-[0.7em] mt-1 text-center w-fit font-medium">
                Custom
              </p>
            </div>
          </div>
        </div>
        {availableLayouts.map((layout) => (
          <div
            key={layout.id}
            onClick={() => handlePickLayout(layout)}
            className={`${
              layoutMode !== 'no-layout' && pickedLayout?.id === layout.id ? 'border-main-cl' : ''
            } NAME-fix-aspect flex justify-center items-center h-16 w-16 border border-gray-300 rounded bg-white mobile-touch cursor-pointer transition`}
          >
            <div
              style={layout.layoutContainerConfigs?.style}
              className="NAME-slots-displayer flex items-center justify-center p-0.5 h-full w-full"
            >
              {layout.slotConfigs.map((slot) => (
                <Slot
                  key={slot.id}
                  slotConfig={slot}
                  isLayoutPicked={layoutMode !== 'no-layout' && pickedLayout?.id === layout.id}
                  layoutType={layout.layoutType}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
