import { ErrorContext } from '@avito-speculant/common'
import { DatabaseError } from '../database.errors.js'

export class PlanNotFoundError extends DatabaseError {
  constructor(context: ErrorContext, code = 101, message = `Plan not found`) {
    super(context, code, message)
  }
}

export class PlanIsEnabledError extends DatabaseError {
  constructor(context: ErrorContext, code = 103, message = `Plan is enabled`) {
    super(context, code, message)
  }
}

export class PlanIsDisabledError extends DatabaseError {
  constructor(context: ErrorContext, code = 103, message = `Plan is disabled`) {
    super(context, code, message)
  }
}
