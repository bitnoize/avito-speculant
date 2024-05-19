import { DomainError, ErrorContext } from '@avito-speculant/common'

export class PlanNotFoundError extends DomainError {
  constructor(context: ErrorContext, code = 101, message = `Plan not found`) {
    super(context, code, message)
  }
}

export class PlanExistsError extends DomainError {
  constructor(context: ErrorContext, code = 102, message = `Plan allready exists`) {
    super(context, code, message)
  }
}

export class PlanIsEnabledError extends DomainError {
  constructor(context: ErrorContext, code = 104, message = `Plan is enabled`) {
    super(context, code, message)
  }
}

export class PlanIsDisabledError extends DomainError {
  constructor(context: ErrorContext, code = 103, message = `Plan is disabled`) {
    super(context, code, message)
  }
}
