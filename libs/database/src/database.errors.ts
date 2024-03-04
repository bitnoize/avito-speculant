export abstract class HighDatabaseError<T> extends Error {
  constructor(
    readonly request: T,
    readonly statusCode: number,
    message: string
  ) {
    super(message)
  }
}

/*
export class InternalError<T> extends KyselyDatabaseError<T> {
  constructor(request: T, statusCode = 500, message = `Internal error`) {
    super(request, statusCode, message)
  }
}
*/
