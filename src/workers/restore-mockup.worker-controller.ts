import { TRestoreMockupWorkerInput } from '@/utils/types/worker'
import RestoreMockupWorker from '@/workers/restore-mockup.worker?worker'

class RestoreMockupWorkerController {
  private worker: Worker

  constructor() {
    this.worker = new RestoreMockupWorker()
  }

  sendRestoreMockupData(data: TRestoreMockupWorkerInput) {
    this.worker.postMessage(data)
  }
}

export const restoreMockupWorkerController = new RestoreMockupWorkerController()
