import { SubscriptionLog } from '../subscription-log.js'

export interface ListSubscriptionLogsRequest {
  subscriptionId: number
  limit?: number
}

export interface ListSubscriptionLogsResponse {
  message: string
  statusCode: number
  subscriptionLogs: SubscriptionLog[]
  limit: number
}
