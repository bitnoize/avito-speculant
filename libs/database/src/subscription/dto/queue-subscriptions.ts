import { Subscription } from '@avito-speculant/domain'

export interface QueueSubscriptionsRequest {
  limit: number
}

export interface QueueSubscriptionsResponse {
  message: string
  statusCode: number
  subscriptions: Subscription[]
}
