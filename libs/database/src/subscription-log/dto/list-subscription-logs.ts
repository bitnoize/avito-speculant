import { SubscriptionLog } from '@avito-speculant/domain'

export interface ListSubscriptionLogsRequest {
  subscriptionId: number
  limit: number
}

export interface ListSubscriptionLogsResponse {
  message: string
  statusCode: number
  subscriptionLogs: SubscriptionLog[]
  limit: number
}
