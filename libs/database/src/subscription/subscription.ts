import { DatabaseError } from '../database.js'

export const SUBSCRIPTION_STATUSES = ['wait', 'cancel', 'active', 'finish']
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number]

export type SubscriptionData = Record<string, unknown>

export interface Subscription {
  id: number
  userId: number
  planId: number
  categoriesMax: number
  priceRub: number
  durationDays: number
  intervalSec: number
  analyticsOn: boolean
  status: SubscriptionStatus
  createTime: Date
  updateTime: Date
  processTime: Date
}

export interface CreateSubscriptionRequest {
  userId: number
  planId: number
  data: SubscriptionData
}

export interface CreateSubscriptionResponse {
  message: string
  statusCode: number
  user: User
  plan: Plan
  subscription: Subscription
}
