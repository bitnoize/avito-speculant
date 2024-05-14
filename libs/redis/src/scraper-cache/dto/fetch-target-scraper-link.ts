import { RedisMethod } from '../../redis.js'

export type FetchTargetScraperLinkRequest = {
  urlPath: string
}

export type FetchTargetScraperLinkResponse = string | undefined

export type FetchTargetScraperLink = RedisMethod<
  FetchTargetScraperLinkRequest,
  FetchTargetScraperLinkResponse
>
