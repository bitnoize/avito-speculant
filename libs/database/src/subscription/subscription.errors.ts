import { DatabaseError } from '../database.errors.js'

export class SubscriptionNotFoundError extends DatabaseError {
  constructor(message: string) {
    super(message)
  }
}
