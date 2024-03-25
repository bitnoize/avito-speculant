import { QueueError } from '../queue.errors.js'

export class ScrapingRequestError extends QueueError {
  constructor(context: unknown, statusCode = 100, message = `Scraping request failed`) {
    super(context, statusCode, message)
  }
}

export class ScrapingParseError extends QueueError {
  constructor(context: unknown, statusCode = 100, message = `Scraping parse failed`) {
    super(context, statusCode, message)
  }
}
