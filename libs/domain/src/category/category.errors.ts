import { DomainError } from '../domain.errors.js'

export class CategoryNotFoundError<T> extends DomainError<T> {
  constructor(request: T, statusCode = 404, message = `Category not found`) {
    super(request, statusCode, message)
  }
}

export class CategoryIsEnabledError<T> extends DomainError<T> {
  constructor(request: T, statusCode = 403, message = `Category is enabled`) {
    super(request, statusCode, message)
  }
}

export class CategoriesLimitExceedError<T> extends DomainError<T> {
  constructor(request: T, statusCode = 403, message = `Category limit exceed`) {
    super(request, statusCode, message)
  }
}
