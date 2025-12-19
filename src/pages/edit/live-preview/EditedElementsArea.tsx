import { useEditedElementStore } from '@/stores/element/element.store'
import { StickerElement } from '../elements/sticker-element/StickerElement'
import { TextElement } from '../elements/text-element/TextElement'
import { useElementLayerStore } from '@/stores/ui/element-layer.store'
import { useSearchParams } from 'react-router-dom'
import { PrintedImageElement } from '../elements/printed-image/PrintedImageElement'

type TEditedElementsAreaProps = {
  allowedPrintAreaRef: React.RefObject<HTMLDivElement | null>
  printAreaContainerRef: React.RefObject<HTMLDivElement | null>
  elementControlRef: React.RefObject<{ todo: (param: any) => void }>
}

export const EditedElementsArea = ({
  allowedPrintAreaRef,
  printAreaContainerRef,
  elementControlRef,
}: TEditedElementsAreaProps) => {
  const stickerElements = useEditedElementStore((s) => s.stickerElements)
  const textElements = useEditedElementStore((s) => s.textElements)
  const printedImages = useEditedElementStore((s) => s.printedImages)
  const selectedElement = useEditedElementStore((s) => s.selectedElement)
  const selectElement = useEditedElementStore((s) => s.selectElement)
  const mockupId = useSearchParams()[0].get('mockupId')
  console.log('>>> [reto] all eles:', { stickerElements, textElements, printedImages })

  return (
    <>
      {stickerElements.length > 0 &&
        stickerElements.map((element) => (
          <StickerElement
            key={element.id}
            element={element}
            allowedPrintAreaRef={allowedPrintAreaRef}
            mountType={mockupId ? 'from-saved' : 'from-new'}
            isSelected={selectedElement?.elementId === element.id}
            selectElement={selectElement}
            removeStickerElement={(elementId) => {
              useElementLayerStore.getState().removeElementLayers([elementId])
              useEditedElementStore.getState().removeStickerElement(elementId)
            }}
            printAreaContainerRef={printAreaContainerRef}
            elementControlRef={elementControlRef}
          />
        ))}

      {textElements.length > 0 &&
        textElements.map((element) => (
          <TextElement
            key={element.id}
            element={element}
            allowedPrintAreaRef={allowedPrintAreaRef}
            mountType={mockupId ? 'from-saved' : 'from-new'}
            isSelected={selectedElement?.elementId === element.id}
            selectElement={selectElement}
            removeTextElement={(elementId) => {
              useElementLayerStore.getState().removeElementLayers([elementId])
              useEditedElementStore.getState().removeTextElement(elementId)
            }}
            printAreaContainerRef={printAreaContainerRef}
            elementControlRef={elementControlRef}
          />
        ))}

      {printedImages.length > 0 &&
        printedImages.map((element) => (
          <PrintedImageElement
            key={element.id}
            element={element}
            allowedPrintAreaRef={allowedPrintAreaRef}
            mountType={mockupId ? 'from-saved' : 'from-new'}
            isSelected={selectedElement?.elementId === element.id}
            selectElement={selectElement}
            removePrintedImageElement={(elementId) => {
              useElementLayerStore.getState().removeElementLayers([elementId])
              useEditedElementStore.getState().removePrintedImageElement(elementId)
            }}
            printAreaContainerRef={printAreaContainerRef}
            elementControlRef={elementControlRef}
          />
        ))}
    </>
  )
}
