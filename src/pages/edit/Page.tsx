import { TBaseProduct, TPrintedImage } from '@/utils/types/global'
import { ProductGallery } from './ProductGallery'
import { ProductDetails } from './product/ProductDetails'
import { Customization } from './customize/Customization'
import { LivePreview } from './live-preview/Live-Preview'
import { useProductUIDataStore } from '@/stores/ui/product-ui-data.store'

type TEditPageProps = {
  products: TBaseProduct[]
  printedImages: TPrintedImage[]
}

export default function EditPage({ products, printedImages }: TEditPageProps) {
  const pickedProduct = useProductUIDataStore((s) => s.pickedProduct)
  const pickedSurface = useProductUIDataStore((s) => s.pickedSurface)
  const pickedVariant = useProductUIDataStore((s) => s.pickedVariant)
  const handlePickProduct = useProductUIDataStore((s) => s.handlePickProduct)

  return (
    <div className="font-sans grid grid-cols-[1fr_6fr] h-screen gap-4">
      <ProductGallery
        products={products}
        printedImages={printedImages}
        onPickProduct={handlePickProduct}
      />
      <div className="NAME-main-parent grid grid-cols-[3fr_2fr] gap-4 h-screen">
        {pickedProduct && pickedVariant && pickedSurface ? (
          <LivePreview
            pickedProduct={pickedProduct}
            editedVariantId={pickedVariant.id}
            editedPrintSurfaceId={pickedSurface.id}
          />
        ) : (
          <div></div>
        )}
        <div className="flex flex-col space-y-2 p-4 pl-2 min-h-full max-h-full overflow-y-auto gallery-scroll border border-gray-400/30">
          {pickedProduct && pickedVariant ? (
            <>
              <ProductDetails pickedProduct={pickedProduct} pickedVariant={pickedVariant} />
              <Customization printedImages={printedImages} />
            </>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  )
}
