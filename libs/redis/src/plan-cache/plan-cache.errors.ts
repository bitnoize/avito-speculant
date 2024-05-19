import { DomainError, ErrorContext } from '@avito-speculant/common'

export class PlanCacheNotFoundError extends DomainError {
  constructor(context: ErrorContext, code = 101, message = `PlanCache not found`) {
    super(context, code, message)
  }
}
