import { ErrorContext } from '@avito-speculant/common'
import { RedisError } from '../redis.errors.js'

export class AvitoUrlScraperError extends RedisError {
  constructor(context: ErrorContext, code = 150, message = `AvitoUrl scraper malformed`) {
    super(context, code, message)
  }
}
