import { TPrintedImage } from '@/utils/types/global'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useEditedElementStore } from '@/stores/element/element.store'
import { useLayoutStore } from '@/stores/ui/print-layout.store'
import { TPrintLayout } from '@/utils/types/print-layout'
import { PreviewImage } from './PreviewImage'
import { buildLayoutByLayoutType } from './builder'
import { createInitialConstants } from '@/utils/contants'
import { CustomScrollbar } from '@/components/custom/CustomScrollbar'

type TLayoutsPickerProps = {
  printedImages: TPrintedImage[]
}

export const LayoutsPicker = ({ printedImages }: TLayoutsPickerProps) => {
  const allLayouts = useLayoutStore((s) => s.allLayouts)
  const updateLayoutElements = useLayoutStore((s) => s.updateLayoutElements)

  // Track xem layout nào đã được build elements
  const [builtLayoutIds, setBuiltLayoutIds] = useState<Set<string>>(new Set())
  // Refs để lưu các layout preview elements
  const layoutPreviewRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  const handlePickTemplate = (layout: TPrintLayout) => {
    useEditedElementStore.getState().cancelSelectingElement()
    // handlePutPrintedImagesInLayout(layout)
    useLayoutStore.getState().pickLayout(layout)
  }

  // Callback để register ref cho mỗi layout preview
  const registerLayoutRef = useCallback((layoutId: string, element: HTMLDivElement | null) => {
    if (element) {
      layoutPreviewRefs.current.set(layoutId, element)
    } else {
      layoutPreviewRefs.current.delete(layoutId)
    }
  }, [])

  // Build elements cho một layout sau khi DOM đã render
  const buildLayoutElements = useCallback(
    (layout: TPrintLayout, previewElement: HTMLDivElement) => {
      try {
        const builtLayout = buildLayoutByLayoutType(
          layout.layoutType,
          previewElement,
          printedImages,
          createInitialConstants('LAYOUT_PADDING')
        )

        // Cập nhật elements vào store
        updateLayoutElements(layout.id, builtLayout.elements)

        return true
      } catch (error) {
        console.error(`Error building layout ${layout.id}:`, error)
        return false
      }
    },
    [printedImages, updateLayoutElements]
  )

  // Effect: Sau khi DOM render, build elements cho các layout chưa có
  useEffect(() => {
    if (allLayouts.length === 0 || printedImages.length === 0) return

    // Đợi DOM render hoàn toàn
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const newBuiltIds = new Set(builtLayoutIds)
        let hasChanges = false

        for (const layout of allLayouts) {
          // Bỏ qua layout đã build
          if (builtLayoutIds.has(layout.id) && layout.printedImageElements.length > 0) {
            continue
          }

          const previewElement = layoutPreviewRefs.current.get(layout.id)
          if (!previewElement) continue

          const success = buildLayoutElements(layout, previewElement)
          if (success) {
            newBuiltIds.add(layout.id)
            hasChanges = true
          }
        }

        if (hasChanges) {
          setBuiltLayoutIds(newBuiltIds)
        }
      })
    })
  }, [allLayouts, printedImages, buildLayoutElements])

  // Reset built flags khi printedImages thay đổi
  useEffect(() => {
    setBuiltLayoutIds(new Set())
  }, [printedImages])

  return (
    <div className="w-full">
      <h3 className="5xl:text-[1.5em] smd:text-sm text-xs mb-1 font-bold text-gray-800">
        Chọn bố cục khung ảnh
      </h3>
      <CustomScrollbar
        classNames={{
          content: 'flex flex-nowrap gap-3 overflow-x-auto no-scrollbar pb-3 pt-1',
        }}
      >
        {allLayouts.map((layout) => (
          <div
            key={layout.id}
            onClick={() => handlePickTemplate(layout)}
            className="relative flex items-center justify-center aspect-square 5xl:min-h-22 min-h-16 border border-gray-300 rounded bg-white mobile-touch cursor-pointer transition"
          >
            {/* Layout preview element - dùng làm print area để build elements */}
            <div
              ref={(el) => registerLayoutRef(layout.id, el)}
              className="NAME-layout-preview-item absolute top-0 left-0 h-full w-full"
            >
              {/* Render preview images khi đã có elements trong store */}
              {layout.printedImageElements?.map((printedImageVisualState) => (
                <PreviewImage
                  key={printedImageVisualState.id}
                  printedImageVisualState={printedImageVisualState}
                />
              ))}
            </div>
          </div>
        ))}
      </CustomScrollbar>
    </div>
  )
}
