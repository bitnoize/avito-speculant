import { DatabaseError } from '../database.errors.js'

export class CategoryNotFoundError<T> extends DatabaseError<T> {
  constructor(request: T, statusCode = 404, message = `Category not found`) {
    super(request, statusCode, message)
  }
}
