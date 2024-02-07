export { DatabaseError as PostgresDatabaseError } from 'pg-protocol'

export { PostgresDatabaseError }

export abstract class DatabaseError<T> extends PostgresDatabaseError {
  constructor(message: string, readonly request: T, readonly statusCode: number) {
    super(message)
  }
}
