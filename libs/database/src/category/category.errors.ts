import { DomainError } from '@avito-speculant/common'

export class CategoryNotFoundError extends DomainError {
  constructor(context: unknown, statusCode = 101, message = `Category not found`) {
    super(context, statusCode, message)
  }
}

export class CategoryIsEnabledError extends DomainError {
  constructor(context: unknown, statusCode = 103, message = `Category is enabled`) {
    super(context, statusCode, message)
  }
}

export class CategoriesLimitExceedError extends DomainError {
  constructor(context: unknown, statusCode = 103, message = `Categories limit exceed`) {
    super(context, statusCode, message)
  }
}
