import { ErrorContext } from './common.js'

/*
 * Abstract class for domain level errors
 */
export abstract class DomainError extends Error {
  constructor(
    readonly context: ErrorContext,
    readonly code: number,
    message: string
  ) {
    super(message)
  }
}
