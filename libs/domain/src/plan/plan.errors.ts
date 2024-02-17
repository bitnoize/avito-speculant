import { DomainError } from '../domain.errors.js'

export class PlanNotFoundError<T> extends DomainError<T> {
  constructor(request: T, statusCode = 404, message = `Plan not found`) {
    super(request, statusCode, message)
  }
}

export class PlanIsEnabledError<T> extends DomainError<T> {
  constructor(request: T, statusCode = 403, message = `Plan is enabled`) {
    super(request, statusCode, message)
  }
}

export class PlanIsDisabledError<T> extends DomainError<T> {
  constructor(request: T, statusCode = 403, message = `Plan is disabled`) {
    super(request, statusCode, message)
  }
}
