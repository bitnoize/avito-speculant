import { DomainError, ErrorContext } from '@avito-speculant/common'

export class ProxyNotFoundError extends DomainError {
  constructor(context: ErrorContext, code = 101, message = `Proxy not found`) {
    super(context, code, message)
  }
}

export class ProxyExistsError extends DomainError {
  constructor(context: ErrorContext, code = 102, message = `Proxy allready exists`) {
    super(context, code, message)
  }
}

export class ProxyIsEnabledError extends DomainError {
  constructor(context: ErrorContext, code = 105, message = `Proxy is enabled`) {
    super(context, code, message)
  }
}

export class ProxyIsDisabledError extends DomainError {
  constructor(context: ErrorContext, code = 105, message = `Proxy is disabled`) {
    super(context, code, message)
  }
}
