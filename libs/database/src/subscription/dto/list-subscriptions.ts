import { Subscription } from '@avito-speculant/domain'

export interface ListSubscriptionsRequest {
  userId: number
  all: boolean
}

export interface ListSubscriptionsResponse {
  message: string
  statusCode: number
  subscriptions: Subscription[]
  all: boolean
}
