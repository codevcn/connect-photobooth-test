import { resizeCanvas } from '@/utils/helpers'
import { domToBlob, domToCanvas } from 'modern-screenshot'

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

/**
 * Decode tất cả ảnh trong container trước khi render
 * Giúp iOS xử lý tốt hơn với nhiều ảnh lớn
 */
const decodeAllImages = async (container: HTMLElement): Promise<void> => {
  const images = container.querySelectorAll('img')
  const decodePromises: Promise<void>[] = []

  images.forEach((img) => {
    if (img.complete && img.naturalWidth > 0) {
      // Ảnh đã load, gọi decode()
      decodePromises.push(
        img.decode().catch((err) => {
          console.warn('[decode] Failed to decode image:', img.src, err)
        })
      )
    } else {
      // Ảnh chưa load, đợi load xong rồi decode
      decodePromises.push(
        new Promise<void>((resolve) => {
          img.onload = () => {
            img
              .decode()
              .then(resolve)
              .catch(() => resolve())
          }
          img.onerror = () => resolve()
        })
      )
    }
  })

  await Promise.all(decodePromises)
  console.log(`[decode] Decoded ${images.length} images`)
}

type TUseHtlmToCanvasReturn = {
  saveHtmlAsImage: (
    htmContainer: HTMLDivElement,
    desiredImgMimeType: string | null,
    scale: number | undefined,
    onSaved: (imgData: Blob, canvas: HTMLCanvasElement) => void,
    onError: (error: Error) => void
  ) => void
  saveHtmlAsImageWithDesiredSizeOldVersion: (
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
  saveHtmlAsImageWithDesiredSize: (
    htmlContainer: HTMLDivElement,
    transparentPrintAreaContainer: HTMLDivElement,
    desiredOutputWidth: number,
    desiredOutputHeight: number,
    upScale: number,
    desiredImgMimeType: string | null,
    onSaved: (
      fullContainerImageData: Blob,
      allowedPrintAreaImageData: Blob,
      allowedPrintAreaCanvas: HTMLCanvasElement
    ) => void,
    onError: (error: Error) => void
  ) => void
  savePrintAreaAsImage: (
    htmContainer: HTMLDivElement,
    allowedPrintArea: HTMLDivElement,
    desiredImgMimeType: string | null,
    upScale: number | undefined,
    onSaved: (
      fullPrintAreaContainer: Blob,
      allowedPrintAreaImage: Blob,
      allowedPrintAreaCanvas: HTMLCanvasElement
    ) => void,
    onError: (error: Error) => void
  ) => void
}

export const useHtmlToCanvas = (): TUseHtlmToCanvasReturn => {
  const savePrintAreaAsImage = async (
    htmContainer: HTMLDivElement,
    allowedPrintArea: HTMLDivElement,
    desiredImgMimeType: string | null,
    upScale: number | undefined,
    onSaved: (
      fullPrintAreaContainer: Blob,
      allowedPrintAreaImage: Blob,
      allowedPrintAreaCanvas: HTMLCanvasElement
    ) => void,
    onError: (error: Error) => void
  ) => {
    try {
      await document.fonts.ready
      const scale: number = upScale || 8
      const [fullContainerCanvas, allowedPrintAreaCanvas] = await Promise.all([
        domToCanvas(htmContainer, {
          scale: scale,
          quality: 1,
          type: desiredImgMimeType || 'image/webp',
        }),
        domToCanvas(allowedPrintArea, {
          scale: scale,
          quality: 1,
          type: desiredImgMimeType || 'image/webp',
        }),
      ])
      const outputList: Blob[] = []
      fullContainerCanvas.toBlob((blob) => {
        if (blob) {
          outputList.push(blob)
          if (outputList.length === 2) {
            onSaved(outputList[0], outputList[1], allowedPrintAreaCanvas)
          }
        } else {
          throw new Error('Failed to convert entire product canvas to Blob')
        }
      }, desiredImgMimeType || 'image/webp')
      allowedPrintAreaCanvas.toBlob((blob) => {
        if (blob) {
          outputList.push(blob)
          if (outputList.length === 2) {
            onSaved(outputList[0], outputList[1], allowedPrintAreaCanvas)
          }
        } else {
          throw new Error('Failed to convert allowed print area canvas to Blob')
        }
      }, desiredImgMimeType || 'image/webp')
    } catch (error) {
      onError(error as Error)
    }
  }

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
    transparentPrintAreaContainer: HTMLDivElement,
    desiredOutputWidth: number,
    desiredOutputHeight: number,
    upScale: number = 8,
    desiredImgMimeType: string | null,
    onSaved: (
      fullContainerImageData: Blob,
      allowedPrintAreaImageData: Blob,
      allowedPrintAreaCanvas: HTMLCanvasElement
    ) => void,
    onError: (error: Error) => void
  ) => {
    requestIdleCallback(async () => {
      // 1️⃣ Decode tất cả ảnh trước
      await decodeAllImages(htmlContainer)
      await decodeAllImages(transparentPrintAreaContainer)

      const mokupImageBlob = await domToBlob(htmlContainer, {
        scale: upScale,
        quality: 1,
        type: desiredImgMimeType || 'image/webp',
      })
      // Lấy vị trí của container và element cần crop
      const containerRect = transparentPrintAreaContainer.getBoundingClientRect()
      const elementRect = transparentPrintAreaContainer
        .querySelector('.NAME-print-area-allowed')
        ?.getBoundingClientRect()
      if (!elementRect) return
      // Tính vị trí relative của element so với container
      const relativeX = elementRect.left - containerRect.left
      const relativeY = elementRect.top - containerRect.top
      // insert(transparentPrintAreaContainer, true)
      const imageDataPromises: Promise<Blob>[] = []
      try {
        await document.fonts.ready

        const fullCanvas = await domToCanvas(transparentPrintAreaContainer, {
          scale: upScale,
          quality: 1,
          type: desiredImgMimeType || 'image/webp',
        })
        imageDataPromises.push(
          new Promise((resolve, reject) => {
            fullCanvas.toBlob((blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('Failed to convert full canvas to Blob'))
              }
            }, desiredImgMimeType || 'image/webp')
          })
        )

        // Tạo canvas mới để crop
        const croppedCanvas = document.createElement('canvas')
        const ctx = croppedCanvas.getContext('2d')

        if (!ctx) {
          return new Error('Failed to get canvas context for cropping')
        }

        // Set kích thước canvas crop (đã scale)
        const cropWidth = elementRect.width * upScale
        const cropHeight = elementRect.height * upScale
        croppedCanvas.width = cropWidth
        croppedCanvas.height = cropHeight

        // Crop vùng cần thiết từ fullCanvas
        ctx.drawImage(
          fullCanvas,
          relativeX * upScale, // source x (đã upScale)
          relativeY * upScale, // source y (đã upScale)
          cropWidth, // source width
          cropHeight, // source height
          0, // destination x
          0, // destination y
          cropWidth, // destination width
          cropHeight // destination height
        )

        imageDataPromises.push(
          new Promise((resolve, reject) => {
            croppedCanvas.toBlob((blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('Failed to convert cropped canvas to Blob'))
              }
            }, desiredImgMimeType || 'image/webp')
          })
        )
        const blobs = await Promise.all(imageDataPromises)
        onSaved(mokupImageBlob, blobs[1], croppedCanvas)
      } catch (error) {
        onError(error as Error)
      }
    })
  }

  const saveHtmlAsImageWithDesiredSizeOldVersion = async (
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
      try {
        const maxImageSizeInPx: number = 5000
        const scale: number = maxImageSizeInPx / htmlContainer.getBoundingClientRect().width
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

  return {
    savePrintAreaAsImage,
    saveHtmlAsImage,
    saveHtmlAsImageWithDesiredSizeOldVersion,
    saveHtmlAsImageCropped,
    saveHtmlAsImageWithDesiredSize,
  }
}
