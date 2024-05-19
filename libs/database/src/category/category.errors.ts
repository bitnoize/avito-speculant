import { DomainError, ErrorContext } from '@avito-speculant/common'

export class CategoryNotFoundError extends DomainError {
  constructor(context: ErrorContext, code = 101, message = `Category not found`) {
    super(context, code, message)
  }
}

export class CategoryExistsError extends DomainError {
  constructor(context: ErrorContext, code = 101, message = `Category allready exists`) {
    super(context, code, message)
  }
}

export class CategoryBotLooseError extends DomainError {
  constructor(context: ErrorContext, code = 118, message = `Category bot loose`) {
    super(context, code, message)
  }
}

export class CategoryBotWasteError extends DomainError {
  constructor(context: ErrorContext, code = 119, message = `Category bot waste`) {
    super(context, code, message)
  }
}

export class CategoryIsEnabledError extends DomainError {
  constructor(context: ErrorContext, code = 110, message = `Category is enabled`) {
    super(context, code, message)
  }
}

export class CategoryIsDisabledError extends DomainError {
  constructor(context: ErrorContext, code = 110, message = `Category is disabled`) {
    super(context, code, message)
  }
}

export class CategoriesLimitExceedError extends DomainError {
  constructor(context: ErrorContext, code = 110, message = `Categories limit exceed`) {
    super(context, code, message)
  }
}
