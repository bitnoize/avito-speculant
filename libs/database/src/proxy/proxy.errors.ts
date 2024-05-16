import { ErrorContext } from '@avito-speculant/common'
import { DatabaseError } from '../database.errors.js'

export class ProxyNotFoundError extends DatabaseError {
  constructor(context: ErrorContext, code = 101, message = `Proxy not found`) {
    super(context, code, message)
  }
}

export class ProxyExistsError extends DatabaseError {
  constructor(context: ErrorContext, code = 102, message = `Proxy allready exists`) {
    super(context, code, message)
  }
}

export class ProxyIsEnabledError extends DatabaseError {
  constructor(context: ErrorContext, code = 105, message = `Proxy is enabled`) {
    super(context, code, message)
  }
}
export class ProxyIsDisabledError extends DatabaseError {
  constructor(context: ErrorContext, code = 105, message = `Proxy is disabled`) {
    super(context, code, message)
  }
}
