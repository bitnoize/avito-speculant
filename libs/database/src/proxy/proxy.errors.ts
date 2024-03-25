import { DomainError } from '@avito-speculant/common'

export class ProxyNotFoundError extends DomainError {
  constructor(context: unknown, statusCode = 101, message = `Proxy not found`) {
    super(context, statusCode, message)
  }
}

export class ProxyAllreadyExistsError extends DomainError {
  constructor(context: unknown, statusCode = 103, message = `Proxy allready exists`) {
    super(context, statusCode, message)
  }
}
