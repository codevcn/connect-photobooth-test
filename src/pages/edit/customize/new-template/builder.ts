import { TPrintedImage, TPrintedImageVisualState } from '@/utils/types/global'

export const buildInitialTemplate = (
  allowedPrintArea: HTMLElement,
  printedImages: TPrintedImage[]
) => {
  const allowedPrintAreaRect = allowedPrintArea.getBoundingClientRect()
  const printAreaWidth = allowedPrintAreaRect.width
  const printAreaHeight = allowedPrintAreaRect.height
  const printedImageVisualStates: TPrintedImageVisualState[][] = []
  let point: number = Infinity
  for (const img of printedImages) {
    const imgWidth = img.width
    const imgHeight = img.height
    const imgRatio = imgWidth / imgHeight
    const scaledImgWidth = printAreaWidth
    const scaledImgHeight = scaledImgWidth / imgRatio
    const areaLeft = printAreaWidth * printAreaHeight - scaledImgWidth * scaledImgHeight
    if (areaLeft < point) { 
      point = areaLeft
    }
  }
}
