import { formatNumberWithCommas, friendlyCurrency } from '@/utils/helpers'
import { TBaseProduct, TClientProductVariant } from '@/utils/types/global'
import { VariantInfo } from './VariantInfo'

type TProductDetailsProps = {
  pickedProduct: TBaseProduct
  pickedVariant: TClientProductVariant
}

export const ProductDetails = ({ pickedProduct, pickedVariant }: TProductDetailsProps) => {
  return (
    <div className="smd:order-1 5xl:text-5xl order-2 w-full flex flex-col">
      <div className="smd:block hidden smd:order-1 order-2 pl-1 smd:pt-0 pt-2">
        <h1 className="sm:text-[1.5em] 5xl:text-[0.7em] smd:mt-0 mt-2 leading-tight text-[1.5em] font-bold text-slate-900 mb-2">
          {pickedProduct.name}
        </h1>
      </div>

      <div className="smd:flex smd:order-2 order-3 hidden items-center space-x-3 pl-1">
        <span className="5xl:text-[0.8em] text-3xl text-orange-600">
          <span className="font-bold">
            {formatNumberWithCommas(pickedVariant.priceAmountOneSide)}
          </span>
          <span className="5xl:text-[0.8em] text-2xl font-medium ml-1">
            {friendlyCurrency(pickedVariant.currency)}
          </span>
        </span>
      </div>

      <VariantInfo pickedProduct={pickedProduct} pickedVariant={pickedVariant} />
    </div>
  )
}
