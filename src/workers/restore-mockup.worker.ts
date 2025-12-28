/// <reference lib="webworker" />

import { TRestoreMockupBodySchema } from '@/utils/types/restore-mockup'
import { TRestoreMockupWorkerInput } from '@/utils/types/worker'

const restoreMockupEndpoint: string = 'http://localhost:4000/restore-mockup'

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
  console.log('>>> [resm] restore mockup data received:', data)
  if (!data) return

  try {
    await sendRestoreMockupDataToServer(data)
  } catch (error) {
    console.error('>>> [resm] restore mockup error:', error)
  }
}
