import { ErrorContext } from '@avito-speculant/common'
import { DatabaseError } from '../database.errors.js'

export class ProxyNotFoundError extends DatabaseError {
  constructor(context: ErrorContext, code = 101, message = `Proxy not found`) {
    super(context, code, message)
  }
}

export class ProxyAllreadyExistsError extends DatabaseError {
  constructor(context: ErrorContext, code = 103, message = `Proxy allready exists`) {
    super(context, code, message)
  }
}
