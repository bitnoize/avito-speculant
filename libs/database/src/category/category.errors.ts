import { ErrorContext } from '@avito-speculant/common'
import { DatabaseError } from '../database.errors.js'

export class CategoryNotFoundError extends DatabaseError {
  constructor(context: ErrorContext, code = 101, message = `Category not found`) {
    super(context, code, message)
  }
}

export class CategoryIsEnabledError extends DatabaseError {
  constructor(context: ErrorContext, code = 103, message = `Category is enabled`) {
    super(context, code, message)
  }
}

export class CategoriesLimitExceedError extends DatabaseError {
  constructor(context: ErrorContext, code = 103, message = `Categories limit exceed`) {
    super(context, code, message)
  }
}
