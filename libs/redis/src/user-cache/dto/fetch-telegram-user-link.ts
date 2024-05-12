import { RedisMethod } from '../../redis.js'

export type FetchTelegramUserLinkRequest = {
  tgFromId: string
}

export type FetchTelegramUserLinkResponse = number | undefined

export type FetchTelegramUserLink = RedisMethod<
  FetchTelegramUserLinkRequest,
  FetchTelegramUserLinkResponse
>
