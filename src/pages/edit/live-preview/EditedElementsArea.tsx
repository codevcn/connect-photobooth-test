import { useEditedElementStore } from '@/stores/element/element.store'
import { StickerElement } from '../elements/sticker-element/StickerElement'
import { TextElement } from '../elements/text-element/TextElement'
import { useElementLayerStore } from '@/stores/ui/element-layer.store'

type TEditedElementsAreaProps = {
  mockupId?: string
  allowedPrintAreaRef: React.RefObject<HTMLDivElement | null>
  printAreaContainerRef: React.RefObject<HTMLDivElement | null>
}

export const EditedElementsArea = ({
  mockupId,
  allowedPrintAreaRef,
  printAreaContainerRef,
}: TEditedElementsAreaProps) => {
  const stickerElements = useEditedElementStore((s) => s.stickerElements)
  const textElements = useEditedElementStore((s) => s.textElements)
  const selectedElement = useEditedElementStore((s) => s.selectedElement)
  const selectElement = useEditedElementStore((s) => s.selectElement)
  const removeTextElement = useEditedElementStore((s) => s.removeTextElement)
  const removeStickerElement = useEditedElementStore((s) => s.removeStickerElement)

  return (
    <>
      {stickerElements.length > 0 &&
        stickerElements.map((element) => (
          <StickerElement
            key={element.id}
            element={element}
            elementContainerRef={allowedPrintAreaRef}
            mountType={mockupId ? 'from-saved' : 'new'}
            isSelected={selectedElement?.elementId === element.id}
            selectElement={selectElement}
            removeStickerElement={(elementId) => {
              useElementLayerStore.getState().removeFromElementLayers([elementId])
              useEditedElementStore.getState().removeStickerElement(elementId)
            }}
            printAreaContainerRef={printAreaContainerRef}
          />
        ))}

      {textElements.length > 0 &&
        textElements.map((element) => (
          <TextElement
            key={element.id}
            element={element}
            elementContainerRef={allowedPrintAreaRef}
            mountType={mockupId ? 'from-saved' : 'new'}
            isSelected={selectedElement?.elementId === element.id}
            selectElement={selectElement}
            removeTextElement={(elementId) => {
              useElementLayerStore.getState().removeFromElementLayers([elementId])
              useEditedElementStore.getState().removeTextElement(elementId)
            }}
            printAreaContainerRef={printAreaContainerRef}
          />
        ))}
    </>
  )
}
