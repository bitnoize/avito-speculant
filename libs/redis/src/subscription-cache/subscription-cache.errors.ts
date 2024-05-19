import { DomainError, ErrorContext } from '@avito-speculant/common'

export class SubscriptionCacheNotFoundError extends DomainError {
  constructor(context: ErrorContext, code = 101, message = `SubscriptionCache not found`) {
    super(context, code, message)
  }
}
