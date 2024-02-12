import { DomainError } from '../domain.errors.js'

export class CategoryNotFoundError<T> extends DomainError<T> {
  constructor(request: T, statusCode = 404, message = `Category not found`) {
    super(request, statusCode, message)
  }
}
