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
      <div className="smd:order-1 order-2 pl-1 pt-2">
        <h1 className="sm:text-[2em] 5xl:text-[0.9em] smd:mt-0 mt-2 leading-tight text-[1.5em] font-bold text-slate-900 mb-2">
          {pickedProduct.name}
        </h1>
      </div>

      <div className="smd:order-2 order-3 flex items-center space-x-3 pl-1">
        <span className="5xl:text-[0.8em] text-3xl text-orange-600">
          <span className="font-bold">
            {formatNumberWithCommas(pickedVariant.priceAmountOneSide)}
          </span>
          <span className="5xl:text-[0.8em] text-2xl font-medium ml-1">
            {friendlyCurrency(pickedVariant.currency)}
          </span>
        </span>
      </div>

      <div className="smd:order-3 order-4 smd:p-3 p-2 bg-orange-50 border border-orange-100 rounded-lg space-y-2 my-2">
        <div className="5xl:text-[0.5em] text-sm flex items-center justify-between gap-2">
          <span className="text-gray-800 font-bold">Chăm sóc khách hàng</span>
          <span className="font-semibold text-orange-600 text-end whitespace-nowrap">
            0987 654 321
          </span>
        </div>
      </div>

      <VariantInfo pickedProduct={pickedProduct} pickedVariant={pickedVariant} />
    </div>
  )
}
