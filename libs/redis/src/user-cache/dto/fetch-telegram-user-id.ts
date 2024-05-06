import { RedisMethod } from '../../redis.js'

export type FetchTelegramUserIdRequest = {
  tgFromId: string
}

export type FetchTelegramUserIdResponse = number | undefined

export type FetchTelegramUserId = RedisMethod<
  FetchTelegramUserIdRequest,
  FetchTelegramUserIdResponse
>
