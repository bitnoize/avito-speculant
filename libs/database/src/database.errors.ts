export abstract class DatabaseError<T> extends Error {
  constructor(
    readonly request: T,
    readonly statusCode: number,
    message: string
  ) {
    super(message)
  }
}

export class DatabaseInternalError<T> extends DatabaseError<T> {
  constructor(request: T, statusCode = 500, message = `Database internal error`) {
    super(request, statusCode, message)
  }
}
