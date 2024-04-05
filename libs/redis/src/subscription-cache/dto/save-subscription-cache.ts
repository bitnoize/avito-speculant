import { RedisMethod } from '../../redis.js'

export type SaveSubscriptionCacheRequest = {
  subscriptionId: number
  userId: number
  planId: number
  categoriesMax: number
  priceRub: number
  durationDays: number
  intervalSec: number
  analyticsOn: boolean
}

export type SaveSubscriptionCacheResponse = void

export type SaveSubscriptionCache = RedisMethod<
  SaveSubscriptionCacheRequest,
  SaveSubscriptionCacheResponse
>
