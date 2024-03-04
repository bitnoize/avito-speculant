import { UserCache } from '../user-cache.js'
import { SubscriptionCache } from '../../subscription-cache/subscription-cache.js'

export interface FetchUserCacheRequest {
  userId: number
}

export interface FetchUserCacheResponse {
  message: string
  statusCode: number
  userCache: UserCache
  subscriptionCache: SubscriptionCache
}
