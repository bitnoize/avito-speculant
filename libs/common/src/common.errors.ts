export abstract class DomainError extends Error {
  private emergency = false

  constructor(readonly context: unknown, readonly statusCode: number, message: string) {
    super(message)
  }

  setEmergency(): DomainError {
    this.emergency = true

    return this
  }

  isEmergency(): boolean {
    return this.emergency
  }
}
