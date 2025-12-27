import { TLogEntry } from './global'
import { TRestoreMockupBodySchema } from './restore-mockup'

export type TBase64WorkerInput = Partial<{
  blob: Blob
  url: string
}>

export type TBase64WorkerOutput = Partial<{
  errorMessage: string
  base64FromURL: string
  originalURL: string
}>

export type TLoggingWorkerInput = TLogEntry

export type TRestoreMockupWorkerInput = TRestoreMockupBodySchema
