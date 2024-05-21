export abstract class ApiError extends Error {
  constructor(
    readonly statusCode: number,
    message: string
  ) {
    super(message)
  }
}

export class ApiUnauthorizedError extends ApiError {
  constructor(statusCode = 401, message = `Unauthorized`) {
    super(statusCode, message)
  }
}

export class ApiNotFoundError extends ApiError {
  constructor(statusCode = 404, message = `Not found`) {
    super(statusCode, message)
  }
}

export class ApiForbiddenError extends ApiError {
  constructor(statusCode = 403, message = `Forbidden`) {
    super(statusCode, message)
  }
}
