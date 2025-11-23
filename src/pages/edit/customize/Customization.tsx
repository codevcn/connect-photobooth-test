import { TElementType, TPrintedImage } from '@/utils/types/global'
import { PrintedImagesPreview } from '../printed-images/PrintedImagesPreview'
import { TemplatesPicker } from './template/TemplatesPicker'
import { StickerPicker } from '../elements/sticker-element/StickerPicker'
import { TextEditor } from '../elements/text-element/TextEditor'
import { useEffect } from 'react'
import { EInternalEvents, eventEmitter } from '@/utils/events'
import { useTemplateStore } from '@/stores/ui/template.store'
import { useEditedElementStore } from '@/stores/element/element.store'

const Instructions = () => {
  return (
    <div className="max-w-2xl mx-auto text-gray-600 text-xs leading-relaxed">
      <ul className="list-disc pl-5 space-y-1.5 font-medium">
        <li>
          <span className="font-bold text-gray-700">Chọn mẫu in:</span> Lựa chọn layout phù hợp với
          số lượng ảnh photobooth của bạn (1-4 khung hình). Nhấn vào ảnh photobooth để mở danh sách
          đầy đủ, sau đó chọn ảnh để cho vào từng khung hình trong mẫu đã chọn.
        </li>
        <li>
          <span className="font-bold text-gray-700">Thêm nhãn dán:</span> Chọn sticker yêu thích để
          trang trí sản phẩm, có thể di chuyển, xoay và phóng to/thu nhỏ tùy ý.
        </li>
        <li>
          <span className="font-bold text-gray-700">Thêm văn bản:</span> Nhập text tùy chỉnh (tên,
          lời chúc, v.v.), chọn font chữ, màu sắc và điều chỉnh vị trí phù hợp.
        </li>
        <li>
          Hoàn tất thiết kế, nhấn{' '}
          <span className="font-bold text-gray-700">"Xem trước bản mockup"</span> để kiểm tra trước
          khi thêm vào giỏ hàng.
        </li>
      </ul>
      <p className="NAME-instructions-note mt-3 font-bold text-gray-800">
        Lưu ý: Hình ảnh xem trước có thể hơi khác so với sản phẩm thực tế về màu sắc do ánh sáng khi
        chụp sản phẩm hoặc màn hình thiết bị của bạn.
      </p>
    </div>
  )
}

type TCustomizeProps = {
  printedImages: TPrintedImage[]
}

export const Customization = ({ printedImages }: TCustomizeProps) => {
  useEffect(() => {
    eventEmitter.on(
      EInternalEvents.PICK_ELEMENT,
      (elementId: string, element: HTMLElement, elementType: TElementType) => {
        let elementURL: string | undefined = undefined
        if (elementType === 'template-frame') {
          const pickedFrame = useTemplateStore.getState().getFrameById(elementId)
          if (pickedFrame) {
            elementURL = pickedFrame.placedImage?.imgURL
          }
        }
        useEditedElementStore.getState().selectElement(elementId, element, elementType, elementURL)
      }
    )
  }, [])

  return (
    <div className="border-border rounded-lg p-3 bg-gray-100 mt-2">
      <h3 className="text-center text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">
        Cá nhân hóa
      </h3>
      <Instructions />
      <div className="overflow-hidden relative w-full mt-6">
        <TemplatesPicker
          printedImagesCount={printedImages.length}
          classNames={{
            templatesList: 'grid grid-cols-3 gap-2',
            templateItem: 'aspect-square',
          }}
        />
        <PrintedImagesPreview printedImages={printedImages} />
        <StickerPicker />
        <TextEditor />
      </div>
    </div>
  )
}
