import { DomainError, ErrorContext } from '@avito-speculant/common'

export class ScraperCacheNotFoundError extends DomainError {
  constructor(context: ErrorContext, code = 101, message = `ScraperCache not found`) {
    super(context, code, message)
  }
}
