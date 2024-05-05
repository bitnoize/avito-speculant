import { RedisMethod } from '../../redis.js'

export type SaveUnpaidUserCacheRequest = {
  userId: number
  userTgFromId: string
  userIsPaid: boolean
  userSubscriptions: number
  userCategories: number
  userBots: number
  userCreatedAt: number
  userUpdatedAt: number
  userQueuedAt: number
}

export type SaveUnpaidUserCacheResponse = void

export type SaveUnpaidUserCache = RedisMethod<
  SaveUnpaidUserCacheRequest,
  SaveUnpaidUserCacheResponse
>
