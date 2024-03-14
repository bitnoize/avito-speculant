import { SubscriptionLog } from '../subscription-log.js'

export interface ListSubscriptionLogsRequest {
  subscriptionId: number
  limit?: number
}

export interface ListSubscriptionLogsResponse {
  subscriptionLogs: SubscriptionLog[]
}
