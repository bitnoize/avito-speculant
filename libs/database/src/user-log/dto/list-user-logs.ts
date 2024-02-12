import { UserLog } from '@avito-speculant/domain'

export interface ListUserLogsRequest {
  userId: number
  limit: number
}

export interface ListUserLogsResponse {
  message: string
  statusCode: number
  userLogs: UserLog[]
  limit: number
}
