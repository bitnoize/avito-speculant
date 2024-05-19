import { DomainError, ErrorContext } from '@avito-speculant/common'

export class ScrapingFoobarError extends DomainError {
  constructor(context: ErrorContext, code = 101, message = `Scraping foobar error`) {
    super(context, code, message)
  }
}
