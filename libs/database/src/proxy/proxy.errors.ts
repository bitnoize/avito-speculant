import { HighDatabaseError } from '../database.errors.js'

export class ProxyNotFoundError<T> extends HighDatabaseError<T> {
  constructor(request: T, statusCode = 404, message = `Proxy not found`) {
    super(request, statusCode, message)
  }
}

export class ProxyIsEnabledError<T> extends HighDatabaseError<T> {
  constructor(request: T, statusCode = 403, message = `Proxy is enabled`) {
    super(request, statusCode, message)
  }
}

export class ProxyIsDisabledError<T> extends HighDatabaseError<T> {
  constructor(request: T, statusCode = 403, message = `Proxy is disabled`) {
    super(request, statusCode, message)
  }
}
