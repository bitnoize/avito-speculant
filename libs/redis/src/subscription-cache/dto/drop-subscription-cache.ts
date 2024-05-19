import { RedisMethod } from '../../redis.js'

export type DropSubscriptionCacheRequest = {
  subscriptionId: number
  userId: number
}

export type DropSubscriptionCache = RedisMethod<DropSubscriptionCacheRequest, void>
