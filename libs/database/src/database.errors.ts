import { DomainError } from '@avito-speculant/common'

export abstract class DatabaseError extends DomainError {
  constructor(context: unknown, statusCode: number, message: string) {
    super(context, statusCode, message)
  }
}

export class DatabaseInternalError extends DatabaseError {
  constructor(context: unknown, statusCode = 100, message = `Database internal error`) {
    super(context, statusCode, message)
  }
}
