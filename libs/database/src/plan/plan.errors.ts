import { DomainError } from '@avito-speculant/common'

export class PlanNotFoundError extends DomainError {
  constructor(context: unknown, statusCode = 101, message = `Plan not found`) {
    super(context, statusCode, message)
  }
}

export class PlanIsEnabledError extends DomainError {
  constructor(context: unknown, statusCode = 103, message = `Plan is enabled`) {
    super(context, statusCode, message)
  }
}

export class PlanIsDisabledError extends DomainError {
  constructor(context: unknown, statusCode = 103, message = `Plan is disabled`) {
    super(context, statusCode, message)
  }
}
