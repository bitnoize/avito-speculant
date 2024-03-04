import { HighDatabaseError } from '../database.errors.js'

export class CategoryNotFoundError<T> extends HighDatabaseError<T> {
  constructor(request: T, statusCode = 404, message = `Category not found`) {
    super(request, statusCode, message)
  }
}

export class CategoryIsEnabledError<T> extends HighDatabaseError<T> {
  constructor(request: T, statusCode = 403, message = `Category is enabled`) {
    super(request, statusCode, message)
  }
}

export class CategoriesLimitExceedError<T> extends HighDatabaseError<T> {
  constructor(request: T, statusCode = 403, message = `Categories limit exceed`) {
    super(request, statusCode, message)
  }
}
