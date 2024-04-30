import { DomainError, ErrorContext } from '@avito-speculant/common'

/*
 * Abstract class for database level errors
 */
export abstract class DatabaseError extends DomainError {
  constructor(context: ErrorContext, code: number, message: string) {
    super(context, code, message)
  }
}
