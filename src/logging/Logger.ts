import { EAppFeature, EAppPage, ELogLevel } from '@/utils/enums'
import LoggingWorker from './LoggingWorker.ts?worker'
import { TLogEntry } from '@/utils/types/global'
import { typeToObject } from '@/utils/helpers'
import { TLoggingWorkerInput } from '@/utils/types/worker'

type TFunctionWithParams = (...args: any[]) => any
type TFilterLogReturn<L extends TFunctionWithParams> = (
  ...args: Parameters<L>
) => ReturnType<L> | undefined

class AppLogger {
  worker: Worker

  constructor() {
    this.worker = new LoggingWorker()
  }

  filterLogByURLPathInclude = <L extends TFunctionWithParams>(
    pathInclude: string,
    logger: L
  ): TFilterLogReturn<L> => {
    if (window.location.pathname.includes(pathInclude)) {
      return (...params: Parameters<L>) => {
        return logger(...params)
      }
    }
    return () => undefined
  }

  logInfo = (
    message: string,
    appPage: EAppPage,
    appFeature: EAppFeature,
    causedElement?: Element
  ): void => {
    const timestamp = new Date().toISOString()
    setTimeout(() => {
      const entry = this.createLogEntry(
        ELogLevel.INFO,
        message,
        appPage,
        appFeature,
        timestamp,
        causedElement
          ? {
              className: causedElement.className,
              id: causedElement.id,
            }
          : undefined
      )
      this.worker.postMessage(typeToObject<TLoggingWorkerInput>(entry))
    }, 0)
  }

  logError = (
    error: Error,
    message: string,
    appPage: EAppPage,
    appFeature: EAppFeature,
    causedElement?: Element
  ): void => {
    const timestamp = new Date().toISOString()
    setTimeout(() => {
      const entry = this.createLogEntry(
        ELogLevel.ERROR,
        message,
        appPage,
        appFeature,
        timestamp,
        causedElement
          ? {
              className: causedElement.className,
              id: causedElement.id,
            }
          : undefined,
        error
      )
      this.worker.postMessage(typeToObject<TLoggingWorkerInput>(entry))
    }, 0)
  }

  private createLogEntry = (
    level: ELogLevel,
    message: string,
    appPage: EAppPage,
    appFeature: EAppFeature,
    timestamp: string,
    causedElement?: TLogEntry['causedElement'],
    error?: Error
  ): TLogEntry => {
    const url = new URL(window.location.href)
    const entry: TLogEntry = {
      timestamp,
      level,
      message,
      causedElement,
      appFeature,
      appPage,
      appCurrentURL: url.origin + url.pathname + url.search,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
      userAgent: navigator.userAgent,
    }
    return entry
  }
}

export const appLogger = new AppLogger()
