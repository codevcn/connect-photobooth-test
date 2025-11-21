import { TPrintedImage } from '@/utils/types/global'
import { PrintedImagesPreview } from '../printed-images/PrintedImagesPreview'
import { TemplatesPicker } from './template/TemplatesPicker'

type TCustomizeProps = {
  printedImages: TPrintedImage[]
}

export const Customization = ({ printedImages }: TCustomizeProps) => {
  return (
    <div className="border-border rounded-lg p-3 bg-gray-100 mt-2">
      <h3 className="text-center text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">
        Cá nhân hóa
      </h3>

      <div className="mt-4">
        <h3 className="mb-1 font-bold text-gray-800">Chọn mẫu in</h3>
        <TemplatesPicker
          printedImagesCount={printedImages.length}
          classNames={{ templatesList: 'grid grid-cols-2 gap-2', templateItem: 'aspect-square' }}
        />
      </div>
      <div className="mt-4">
        <h3 className="mb-1 font-bold text-gray-800">Chọn ảnh chụp photobooth</h3>
        <PrintedImagesPreview printedImages={printedImages} />
      </div>
    </div>
  )
}
