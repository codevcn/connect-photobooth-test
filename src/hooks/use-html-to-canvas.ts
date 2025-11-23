import { resizeCanvas } from '@/utils/helpers'
import { domToCanvas } from 'modern-screenshot'

/**
 * Crop canvas to a specific region
 */
const cropCanvas = (
  sourceCanvas: HTMLCanvasElement,
  x: number,
  y: number,
  cropWidth: number,
  cropHeight: number,
  outputWidth: number,
  outputHeight: number
): HTMLCanvasElement => {
  const croppedCanvas = document.createElement('canvas')
  croppedCanvas.width = cropWidth
  croppedCanvas.height = cropHeight

  const ctx = croppedCanvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas context for cropping')
  }

  // Draw the cropped region
  ctx.drawImage(sourceCanvas, x, y, cropWidth, cropHeight, 0, 0, outputWidth, outputHeight)

  return croppedCanvas
}

type TUseHtlmToCanvasReturn = {
  saveHtmlAsImage: (
    htmContainer: HTMLDivElement,
    desiredImgMimeType: string | null,
    scale: number | undefined,
    onSaved: (imgData: Blob, canvas: HTMLCanvasElement) => void,
    onError: (error: Error) => void
  ) => void
  saveHtmlAsImageWithDesiredSize: (
    htmlContainer: HTMLDivElement,
    desiredOutputWidth: number,
    desiredOutputHeight: number,
    desiredImgMimeType: string | null,
    onSaved: (imgData: Blob, canvas: HTMLCanvasElement, originalCanvas: HTMLCanvasElement) => void,
    onError: (error: Error) => void
  ) => void
  saveHtmlAsImageCropped: (
    htmlContainer: HTMLDivElement,
    cropBounds: DOMRect,
    desiredOutputWidth: number,
    desiredOutputHeight: number,
    desiredImgMimeType: string | null,
    onSaved: (imgData: Blob, canvas: HTMLCanvasElement) => void,
    onError: (error: Error) => void
  ) => void
}

export const useHtmlToCanvas = (): TUseHtlmToCanvasReturn => {
  const saveHtmlAsImage = async (
    htmContainer: HTMLDivElement,
    desiredImgMimeType: string | null,
    upScale: number | undefined,
    onSaved: (imgData: Blob, canvas: HTMLCanvasElement) => void,
    onError: (error: Error) => void
  ) => {
    requestIdleCallback(async () => {
      try {
        await document.fonts.ready
        const scale: number = upScale || 8
        const canvas = await domToCanvas(htmContainer, {
          scale: scale,
          quality: 1,
          type: desiredImgMimeType || 'image/webp',
        })
        canvas.toBlob((blob) => {
          if (blob) {
            onSaved(blob, canvas)
          } else {
            onError(new Error('Failed to convert resized canvas to Blob'))
          }
        })
      } catch (error) {
        onError(error as Error)
      }
    })
  }

  const saveHtmlAsImageWithDesiredSize = async (
    htmlContainer: HTMLDivElement,
    desiredOutputWidth: number,
    desiredOutputHeight: number,
    desiredImgMimeType: string | null,
    onSaved: (
      imgData: Blob,
      canvasWithDesiredSize: HTMLCanvasElement,
      originalCanvas: HTMLCanvasElement
    ) => void,
    onError: (error: Error) => void
  ) => {
    requestIdleCallback(async () => {
      console.log('>>> print Area:', htmlContainer)
      console.log('>>> print Area bounding rect:', htmlContainer.getBoundingClientRect())
      try {
        const maxImageSizeInPx: number = 5000
        const scale: number = maxImageSizeInPx / htmlContainer.getBoundingClientRect().width
        console.log('>>> scale:', scale)
        const canvas = await domToCanvas(htmlContainer, {
          scale: 8,
          quality: 1,
          type: desiredImgMimeType || 'image/webp',
        })
        const finalCanvas = resizeCanvas(canvas, desiredOutputWidth, desiredOutputHeight)
        if (!finalCanvas) {
          throw new Error('Failed to resize canvas to desired size')
        }
        canvas.toBlob((blob) => {
          if (blob) {
            onSaved(blob, finalCanvas, canvas)
          } else {
            onError(new Error('Failed to convert resized canvas to Blob'))
          }
        })
      } catch (error) {
        onError(error as Error)
      }
    })
  }

  const saveHtmlAsImageCropped = async (
    htmlContainer: HTMLDivElement,
    cropBounds: DOMRect,
    desiredOutputWidth: number,
    desiredOutputHeight: number,
    desiredImgMimeType: string | null,
    onSaved: (imgData: Blob, canvasWithDesiredSize: HTMLCanvasElement) => void,
    onError: (error: Error) => void
  ) => {
    try {
      const maxImageSizeInPx: number = 5000
      const scale: number = maxImageSizeInPx / htmlContainer.getBoundingClientRect().width

      // Capture full canvas
      const fullCanvas = await domToCanvas(htmlContainer, {
        scale: scale,
        quality: 1,
        type: desiredImgMimeType || 'image/webp',
      })

      // Crop to print area (scaled coordinates)
      const croppedCanvas = cropCanvas(
        fullCanvas,
        cropBounds.x * scale,
        cropBounds.y * scale,
        cropBounds.width * scale,
        cropBounds.height * scale,
        desiredOutputWidth,
        desiredOutputHeight
      )

      croppedCanvas.toBlob((blob) => {
        if (blob) {
          onSaved(blob, croppedCanvas)
        } else {
          onError(new Error('Failed to convert resized canvas to Blob'))
        }
      }, desiredImgMimeType || 'image/webp')
    } catch (error) {
      onError(error as Error)
    }
  }

  return { saveHtmlAsImage, saveHtmlAsImageWithDesiredSize, saveHtmlAsImageCropped }
}
