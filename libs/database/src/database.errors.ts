export abstract class DatabaseError<T> extends Error {
  constructor(readonly request: T, message: string, readonly statusCode: number) {
    super(message)
  }
}

export class DatabaseInternalError<T> extends DatabaseError<T> {
  constructor(request: T, message = `Database internal error`, statusCode = 500) {
    super(request, message, statusCode)
  }
}
