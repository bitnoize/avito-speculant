export abstract class ApiError extends Error {
  constructor(
    readonly statusCode: number,
    message: string
  ) {
    super(message)
  }
}

export class ApiNotFoundError extends ApiError {
  constructor(statusCode = 400, message = `Not found`) {
    super(statusCode, message)
  }
}

export class UnauthorizedError extends ApiError {
  constructor(statusCode = 401, message = `Unauthorized`) {
    super(statusCode, message)
  }
}

export class ForbiddenError extends ApiError {
  constructor(statusCode = 403, message = `Forbidden`) {
    super(statusCode, message)
  }
}
