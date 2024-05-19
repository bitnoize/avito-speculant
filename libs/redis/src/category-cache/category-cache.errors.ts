import { DomainError, ErrorContext } from '@avito-speculant/common'

export class CategoryCacheNotFoundError extends DomainError {
  constructor(context: ErrorContext, code = 101, message = `CategoryCache not found`) {
    super(context, code, message)
  }
}
