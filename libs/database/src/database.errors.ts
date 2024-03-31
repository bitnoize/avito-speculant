import { DomainError, ErrorContext } from '@avito-speculant/common'

/*
 * Abstract class for database level errors
 */
export abstract class DatabaseError extends DomainError {
  constructor(context: ErrorContext, code: number, message: string) {
    super(false, context, code, message)
  }
}

export class DatabaseInternalError extends DatabaseError {
  constructor(context: ErrorContext, code = 100, message = `Database internal error`) {
    super(context, code, message)
  }
}
