import { useState, useRef, useCallback, useMemo } from 'react'
import { type Crop } from 'react-image-crop'
import { TUserInputImage } from '@/utils/types/global'
import { createCommonConstants } from '@/utils/contants'

type UseCropImageOptions = {
  imageData?: TUserInputImage
  onCropComplete?: (croppedImage: TUserInputImage | null, error: Error | null) => void
}

type CropResult = {
  blob: Blob
  url: string
}

export const useImageCrop = ({ imageData, onCropComplete }: UseCropImageOptions = {}) => {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<Crop>()
  const [isCropping, setIsCropping] = useState<boolean>(false)
  const [customWidth, setCustomWidth] = useState<number>(0)
  const [customHeight, setCustomHeight] = useState<number>(0)
  const imgRef = useRef<HTMLImageElement>(null)
  const cropRef = useRef(crop)

  const [minCropSizeWidth, minCropSizeHeight] = useMemo<[number, number]>(() => {
    return [
      createCommonConstants<number>('MIN_CROP_SIZE_WIDTH'),
      createCommonConstants<number>('MIN_CROP_SIZE_HEIGHT'),
    ]
  }, [])

  // Sync crop to ref to avoid stale closure
  const syncCropToRef = useCallback((newCrop: Crop | undefined) => {
    cropRef.current = newCrop
  }, [])

  // Handle crop change from ReactCrop component
  const handleCropChange = useCallback((c: Crop) => {
    setCrop(c)
    syncCropToRef(c)
    setCustomWidth(Math.round(c.width))
    setCustomHeight(Math.round(c.height))
  }, [syncCropToRef])

  // Handle crop complete event
  const handleCropComplete = useCallback((c: Crop) => {
    setCompletedCrop(c)
  }, [])

  // Initialize crop area when image loads
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const image = e.currentTarget
    const { width, height } = image.getBoundingClientRect()

    const initialCrop: Crop = {
      unit: '%',
      x: 5,
      y: 5,
      width: 90,
      height: 90,
    }
    setCrop(initialCrop)
    syncCropToRef(initialCrop)
    setCompletedCrop(initialCrop)

    setCustomWidth(Math.round(width * 0.9))
    setCustomHeight(Math.round(height * 0.9))
  }, [syncCropToRef])

  // Update crop width programmatically
  const updateCropWidth = useCallback((width: number) => {
    const image = imgRef.current
    const currentCrop = cropRef.current
    if (!image || !currentCrop) return

    const maxWidth = image.getBoundingClientRect().width
    const constrainedWidth = Math.min(Math.max(width, minCropSizeWidth), maxWidth)

    const newCrop: Crop = {
      ...currentCrop,
      width: constrainedWidth,
      x: Math.min(currentCrop.x, maxWidth - constrainedWidth),
    }

    setCrop(newCrop)
    syncCropToRef(newCrop)
    setCompletedCrop(newCrop)
    setCustomWidth(Math.round(constrainedWidth))
  }, [minCropSizeWidth, syncCropToRef])

  // Update crop height programmatically
  const updateCropHeight = useCallback((height: number) => {
    const image = imgRef.current
    const currentCrop = cropRef.current
    if (!image || !currentCrop) return

    const maxHeight = image.getBoundingClientRect().height
    const constrainedHeight = Math.min(Math.max(height, minCropSizeHeight), maxHeight)

    const newCrop: Crop = {
      ...currentCrop,
      height: constrainedHeight,
      y: Math.min(currentCrop.y, maxHeight - constrainedHeight),
    }

    setCrop(newCrop)
    syncCropToRef(newCrop)
    setCompletedCrop(newCrop)
    setCustomHeight(Math.round(constrainedHeight))
  }, [minCropSizeHeight, syncCropToRef])

  // Perform the actual crop operation
  const performCrop = useCallback((): Promise<CropResult> => {
    return new Promise((resolve, reject) => {
      const image = imgRef.current
      if (!image || !completedCrop || !imageData) {
        reject(new Error('Missing required data for cropping'))
        return
      }

      if (isCropping) {
        reject(new Error('Crop operation already in progress'))
        return
      }

      setIsCropping(true)

      queueMicrotask(() => {
        try {
          const canvas = document.createElement('canvas')
          const scaleX = image.naturalWidth / image.width
          const scaleY = image.naturalHeight / image.height

          let targetWidth = Math.floor(completedCrop.width * scaleX)
          let targetHeight = Math.floor(completedCrop.height * scaleY)

          const MAX_DIMENSION = 2000
          if (targetWidth > MAX_DIMENSION || targetHeight > MAX_DIMENSION) {
            const scale = Math.min(MAX_DIMENSION / targetWidth, MAX_DIMENSION / targetHeight)
            targetWidth = Math.floor(targetWidth * scale)
            targetHeight = Math.floor(targetHeight * scale)
          }

          canvas.width = targetWidth
          canvas.height = targetHeight

          if (canvas.width < 10 || canvas.height < 10) {
            setIsCropping(false)
            reject(new Error('Crop area too small'))
            return
          }

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            setIsCropping(false)
            reject(new Error('Failed to get canvas context'))
            return
          }

          const cropX = completedCrop.x * scaleX
          const cropY = completedCrop.y * scaleY

          ctx.drawImage(
            image,
            cropX,
            cropY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
          )

          const format = imageData?.blob.type === 'image/png' ? 'image/png' : 'image/jpeg'
          const quality = format === 'image/jpeg' ? 0.92 : 1

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                setIsCropping(false)
                reject(new Error('Failed to create blob from canvas'))
                return
              }

              const result: CropResult = {
                blob,
                url: URL.createObjectURL(blob),
              }

              setIsCropping(false)
              resolve(result)
            },
            format,
            quality
          )
        } catch (error) {
          setIsCropping(false)
          reject(error instanceof Error ? error : new Error('Unknown error during crop'))
        }
      })
    })
  }, [completedCrop, imageData, isCropping])

  // Execute crop and call onCropComplete callback
  const executeCrop = useCallback(async () => {
    try {
      const result = await performCrop()
      onCropComplete?.(
        {
          blob: result.blob,
          url: result.url,
        },
        null
      )
      return result
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to crop image')
      onCropComplete?.(null, err)
      throw err
    }
  }, [performCrop, onCropComplete])

  // Reset crop state
  const resetCrop = useCallback(() => {
    setCrop(undefined)
    setCompletedCrop(undefined)
    setCustomWidth(0)
    setCustomHeight(0)
    setIsCropping(false)
  }, [])

  return {
    // State
    crop,
    completedCrop,
    isCropping,
    customWidth,
    customHeight,
    minCropSizeWidth,
    minCropSizeHeight,

    // Refs
    imgRef,

    // Handlers for ReactCrop component
    handleCropChange,
    handleCropComplete,
    onImageLoad,

    // Programmatic crop updates
    updateCropWidth,
    updateCropHeight,

    // Crop execution
    executeCrop,
    performCrop,

    // Utilities
    resetCrop,
  }
}
