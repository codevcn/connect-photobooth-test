import { TElementType, TPrintedImage } from '@/utils/types/global'
import { PrintedImagesPreview } from '../printed-images/PrintedImagesPreview'
import { TemplatesPicker } from './template/TemplatesPicker'
import { StickerMenuWrapper, StickerPicker } from '../elements/sticker-element/StickerPicker'
import { TextEditor, TextMenuWrapper } from '../elements/text-element/TextEditor'
import { useEffect } from 'react'
import { EInternalEvents, eventEmitter } from '@/utils/events'
import { useTemplateStore } from '@/stores/ui/template.store'
import { useEditedElementStore } from '@/stores/element/element.store'

const Instructions = () => {
  return (
    <div className="hidden smd:block max-w-2xl mx-auto text-gray-600 text-xs leading-relaxed mt-4">
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
  // useEffect(() => {
  //   eventEmitter.on(
  //     EInternalEvents.PICK_ELEMENT,
  //     (elementId: string, element: HTMLElement, elementType: TElementType) => {
  //       let elementURL: string | undefined = undefined
  //       if (elementType === 'template-frame') {
  //         const pickedFrame = useTemplateStore.getState().getFrameById(elementId)
  //         if (pickedFrame) {
  //           elementURL = pickedFrame.placedImage?.imgURL
  //         }
  //       }
  //       useEditedElementStore.getState().selectElement(elementId, element, elementType, elementURL)
  //     }
  //   )
  // }, [])

  return (
    <div className="smd:order-2 smd:mt-2 mt-0 order-1 border-border rounded-lg p-3 bg-gray-100">
      <h3 className="text-xs smd:text-sm text-center font-bold text-gray-800 uppercase tracking-wide">
        Cá nhân hóa
      </h3>
      <Instructions />
      <div className="smd:mt-6 mt-1 overflow-hidden relative w-full">
        <TemplatesPicker
          printedImages={printedImages}
          classNames={{
            templatesList:
              'smd:grid-cols-3 smd:overflow-x-hidden smd:grid-flow-row grid-rows-1 grid-flow-col overflow-x-auto grid-flow grid gap-2 w-full gallery-scroll',
            templateItem: 'aspect-square',
          }}
        />
        <div className="grid grid-cols-1 smd:grid-cols-2 flex-wrap gap-3">
          <PrintedImagesPreview printedImages={printedImages} />
          <div className="flex col-span-2 gap-2">
            <StickerPicker />
            <TextEditor />
          </div>
        </div>
        <TextMenuWrapper />
        <StickerMenuWrapper />
      </div>
    </div>
  )
}
