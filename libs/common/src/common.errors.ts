import { ErrorContext } from './common.js'

/*
 * Abstract class for domain level errors
 */
export abstract class DomainError extends Error {
  constructor(
    private emergency: boolean,
    readonly context: ErrorContext,
    readonly code: number,
    message: string
  ) {
    super(message)
  }

  setEmergency(): void {
    if (!this.emergency) {
      this.emergency = true
    }
  }

  isEmergency(): boolean {
    return this.emergency
  }
}
