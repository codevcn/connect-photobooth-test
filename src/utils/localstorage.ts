import { generateUniqueId } from './helpers'
import {
  TBaseProduct,
  TClientProductVariant,
  TElementsVisualState,
  TMockupData,
  TMockupDataId,
  TMockupImageData,
  TProductCartInfo,
  TProductInCart,
  TProductVariantInCart,
  TSavedMockupData,
} from './types/global'

export class LocalStorageHelper {
  private static mockupImageName = 'mockup-data'

  private static generateMockupId(): string {
    return generateUniqueId()
  }

  private static createMockupData(
    elementsVisualState: TElementsVisualState,
    imageData: TMockupImageData,
    surfaceInfo: TMockupData['surfaceInfo'],
    mockupId?: TMockupDataId
  ): TMockupData {
    return {
      id: mockupId || this.generateMockupId(),
      elementsVisualState,
      imageData,
      surfaceInfo,
    }
  }

  static saveMockupImageAtLocal(
    sessionId: string,
    productInfo: TProductCartInfo,
    productVariantInfo: Omit<TProductVariantInCart, 'mockupDataList'>,
    surfaceInfo: TMockupData['surfaceInfo'],
    mockupImageData: TMockupImageData,
    elementsVisualState: TElementsVisualState,
    mockupId?: TMockupDataId
  ): TMockupDataId {
    let existingData = this.getSavedMockupData()

    // Tạo mockup data mới
    const newMockupData = this.createMockupData(
      elementsVisualState,
      mockupImageData,
      surfaceInfo,
      mockupId
    )

    const createNewProductInCart = (): TProductInCart => {
      return {
        ...productInfo,
        productVariants: [{ ...productVariantInfo, mockupDataList: [newMockupData] }],
      }
    }

    if (existingData && existingData.sessionId === sessionId) {
      const newProductId = productInfo.productId
      let productFound = false

      // Tìm sản phẩm đã tồn tại
      for (const product of existingData.productsInCart) {
        if (product.productId === newProductId) {
          // Tìm variant đã tồn tại
          let variantFound = false
          for (const variant of product.productVariants) {
            if (variant.variantId === productVariantInfo.variantId) {
              // Thêm mockup data mới vào variant
              variant.mockupDataList.push(newMockupData)
              variantFound = true
              break
            }
          }
          if (!variantFound) {
            product.productVariants.push({
              ...productVariantInfo,
              mockupDataList: [newMockupData],
            })
          }
          productFound = true
        }
      }
      // Nếu chưa có sản phẩm này, tạo mới
      if (!productFound) {
        existingData.productsInCart.push(createNewProductInCart())
      }
    } else {
      this.clearAllMockupData()
      // Tạo product mới hoàn toàn
      existingData = {
        sessionId,
        productsInCart: [createNewProductInCart()],
      }
    }

    localStorage.setItem(LocalStorageHelper.mockupImageName, JSON.stringify(existingData))
    return newMockupData.id
  }

  static getSavedMockupData(): TSavedMockupData | null {
    const data = localStorage.getItem(LocalStorageHelper.mockupImageName)
    return data ? JSON.parse(data) : null
  }

  static countSavedMockupImages(): number {
    const data = this.getSavedMockupData()
    let count: number = 0
    if (data) {
      for (const product of data.productsInCart) {
        for (const variant of product.productVariants) {
          count += variant.mockupDataList.length
        }
      }
    }
    return count
  }

  static removeSavedMockupImage(
    sessionId: string,
    productId: TBaseProduct['id'],
    productVariantId: TClientProductVariant['id'],
    mockupDataId: string
  ) {
    const data = this.getSavedMockupData()
    if (!data || data.sessionId !== sessionId) return
    for (const product of data.productsInCart) {
      if (product.productId !== productId) continue
      for (const variant of product.productVariants) {
        if (variant.variantId !== productVariantId) continue
        const mockupIndexFound = variant.mockupDataList.findIndex((m) => m.id === mockupDataId)
        if (mockupIndexFound >= 0) {
          variant.mockupDataList.splice(mockupIndexFound, 1)
          localStorage.setItem(LocalStorageHelper.mockupImageName, JSON.stringify(data))
          return
        }
      }
    }
  }

  static updateMockupQuantity(
    sessionId: string,
    productId: TBaseProduct['id'],
    productVariantId: TClientProductVariant['id'],
    mockupDataId: TMockupData['id'],
    amount: number
  ) {
    const data = this.getSavedMockupData()
    if (!data || data.sessionId !== sessionId) return

    for (const product of data.productsInCart) {
      if (product.productId !== productId) continue
      for (const variant of product.productVariants) {
        if (variant.variantId !== productVariantId) continue
        const mockupIndex = variant.mockupDataList.findIndex((m) => m.id === mockupDataId)
        if (mockupIndex >= 0) {
          const mockupFound = variant.mockupDataList[mockupIndex]
          if (amount > 0) {
            // Thêm bản sao mockup
            for (let i = 0; i < amount; i++) {
              variant.mockupDataList.push(
                this.createMockupData(
                  mockupFound.elementsVisualState,
                  mockupFound.imageData,
                  mockupFound.surfaceInfo,
                  this.generateMockupId()
                )
              )
            }
          } else if (amount < 0) {
            // Xóa bớt mockup
            variant.mockupDataList.splice(
              mockupIndex,
              Math.min(-amount, variant.mockupDataList.length)
            ) // Đảm bảo không xóa quá số lượng hiện có
          }
          localStorage.setItem(LocalStorageHelper.mockupImageName, JSON.stringify(data))
          return
        }
      }
    }
  }

  static updateMockupImagePreSent(
    sessionId: string,
    productId: TBaseProduct['id'],
    productVariantId: TClientProductVariant['id'],
    mockupId: TMockupData['id'],
    preSentImageLink: TMockupData['preSentImageLink'],
    preSentImageSize: TMockupData['imageData']['size']
  ): boolean {
    const data = this.getSavedMockupData()
    if (!data || data.sessionId !== sessionId) return false

    for (const product of data.productsInCart) {
      if (product.productId !== productId) continue
      for (const variant of product.productVariants) {
        if (variant.variantId !== productVariantId) continue
        const mockupIndexFound = variant.mockupDataList.findIndex((m) => m.id === mockupId)
        if (mockupIndexFound >= 0) {
          // Cập nhật mockup với các thuộc tính mới
          const mockup = variant.mockupDataList[mockupIndexFound]
          mockup.preSentImageLink = preSentImageLink
          mockup.imageData = {
            ...mockup.imageData,
            size: preSentImageSize,
          }
          localStorage.setItem(LocalStorageHelper.mockupImageName, JSON.stringify(data))
          return true
        }
      }
    }

    return false
  }

  static clearAllMockupData() {
    localStorage.removeItem(LocalStorageHelper.mockupImageName)
  }
}
