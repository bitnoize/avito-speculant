import { RedisMethod } from '../../redis.js'

export type FetchTelegramUserLinkRequest = {
  tgFromId: string
}

export type FetchTelegramUserLinkResponse = {
  userId?: number
}

export type FetchTelegramUserLink = RedisMethod<
  FetchTelegramUserLinkRequest,
  FetchTelegramUserLinkResponse
>
