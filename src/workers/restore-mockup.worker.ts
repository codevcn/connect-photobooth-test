/// <reference lib="webworker" />

import { TRestoreMockupBodySchema } from '@/utils/types/restore-mockup'
import { TRestoreMockupWorkerInput } from '@/utils/types/worker'

const restoreMockupEndpoint: string = '/restore-mockup'

const sendRestoreMockupDataToServer = async (data: TRestoreMockupBodySchema) => {
  const response = await fetch(restoreMockupEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  return await response.json()
}

self.onmessage = async (e) => {
  const data = e.data as TRestoreMockupWorkerInput
  if (!data) return

  try {
    await sendRestoreMockupDataToServer(data)
  } catch (error) {
    console.error('>>> [wrk] restore mockup error:', error)
  }
}
