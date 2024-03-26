export abstract class DomainError extends Error {
  private emergency = false

  constructor(readonly context: unknown, readonly statusCode: number, message: string) {
    super(message)
  }

  setEmergency(): void {
    this.emergency = true
  }

  isEmergency(): boolean {
    return this.emergency
  }
}
