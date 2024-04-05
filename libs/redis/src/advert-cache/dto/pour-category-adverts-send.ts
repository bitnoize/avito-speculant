import { RedisMethod } from '../../redis.js'

export type PourCategoryAdvertsSendRequest = {
  categoryId: number
  count: number
}

export type PourCategoryAdvertsSendResponse = void

export type PourCategoryAdvertsSend = RedisMethod<
  PourCategoryAdvertsSendRequest,
  PourCategoryAdvertsSendResponse
>
