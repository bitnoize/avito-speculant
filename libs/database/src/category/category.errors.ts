import { ErrorContext } from '@avito-speculant/common'
import { DatabaseError } from '../database.errors.js'

export class CategoryNotFoundError extends DatabaseError {
  constructor(context: ErrorContext, code = 101, message = `Category not found`) {
    super(context, code, message)
  }
}

export class CategoryExistsError extends DatabaseError {
  constructor(context: ErrorContext, code = 101, message = `Category allready exists`) {
    super(context, code, message)
  }
}

export class CategoryBotLooseError extends DatabaseError {
  constructor(context: ErrorContext, code = 118, message = `Category bot loose`) {
    super(context, code, message)
  }
}

export class CategoryBotWasteError extends DatabaseError {
  constructor(context: ErrorContext, code = 119, message = `Category bot waste`) {
    super(context, code, message)
  }
}

export class CategoriesLimitExceedError extends DatabaseError {
  constructor(context: ErrorContext, code = 110, message = `Categories limit exceed`) {
    super(context, code, message)
  }
}
