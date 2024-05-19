import { DomainError, ErrorContext } from '@avito-speculant/common'

export class ProxyCacheNotFoundError extends DomainError {
  constructor(context: ErrorContext, code = 101, message = `ProxyCache not found`) {
    super(context, code, message)
  }
}

export class OnlineProxyCacheNotFoundError extends DomainError {
  constructor(context: ErrorContext, code = 101, message = `Online ProxyCache not found`) {
    super(context, code, message)
  }
}
