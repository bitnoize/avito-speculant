import { User, Plan, Subscription } from '@avito-speculant/domain'

export interface ListSubscriptionsRequest {
  userId: number
  all: boolean
}

export interface ListSubscriptionsResponse {
  message: string
  statusCode: number
  user: User
  plans: Plan[]
  subscriptions: Subscription[]
  all: boolean
}
