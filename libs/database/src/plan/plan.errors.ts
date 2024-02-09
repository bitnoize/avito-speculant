import { DatabaseError } from '../database.errors.js'

export class PlanNotFoundError<T> extends DatabaseError<T> {
  constructor(request: T, statusCode = 404, message = `Plan not found`) {
    super(request, statusCode, message)
  }
}

export class PlanDisabledError<T> extends DatabaseError<T> {
  constructor(request: T, statusCode = 403, message = `Plan disabled`) {
    super(request, statusCode, message)
  }
}
