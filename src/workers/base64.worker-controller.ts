import { useCommonDataStore } from '@/stores/ui/common-data.store'
import { TBase64WorkerInput, TBase64WorkerOutput } from '@/utils/types/worker'
import Base64Worker from '@/workers/base64.worker.ts?worker'

class Base64WorkerHelper {
  private worker: Worker

  constructor() {
    this.worker = new Base64Worker()
    this.worker.onmessage = (e) => {
      const data = e.data as TBase64WorkerOutput
      console.log('>>> [work] Received message from worker:', data)
      const { base64FromURL, originalURL } = data
      if (!base64FromURL || !originalURL) return
      useCommonDataStore.getState().setURLAsBase64(originalURL, base64FromURL)
    }
  }

  createBase64FromURL(payload: TBase64WorkerInput) {
    this.worker.postMessage(payload)
  }
}

export const base64WorkerHelper = new Base64WorkerHelper()
