import { DomainError, ErrorContext } from '@avito-speculant/common'

export class AdvertCacheNotFoundError extends DomainError {
  constructor(context: ErrorContext, code = 101, message = `AdvertCache not found`) {
    super(context, code, message)
  }
}
