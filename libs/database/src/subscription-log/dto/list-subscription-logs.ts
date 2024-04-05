import { SubscriptionLog } from '../subscription-log.js'
import { DatabaseMethod } from '../../database.js'

export type ListSubscriptionLogsRequest = {
  subscriptionId: number
  limit: number
}

export type ListSubscriptionLogsResponse = {
  subscriptionLogs: SubscriptionLog[]
}

export type ListSubscriptionLogs = DatabaseMethod<
  ListSubscriptionLogsRequest,
  ListSubscriptionLogsResponse
>
