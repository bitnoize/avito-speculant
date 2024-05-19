import { DomainError, ErrorContext } from '@avito-speculant/common'

export class ReportCacheNotFoundError extends DomainError {
  constructor(context: ErrorContext, code = 101, message = `ReportCache not found`) {
    super(context, code, message)
  }
}
