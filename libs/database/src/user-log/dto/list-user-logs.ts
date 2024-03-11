import { UserLog } from '../user-log.js'

export interface ListUserLogsRequest {
  userId: number
  limit?: number
}

export interface ListUserLogsResponse {
  message: string
  userLogs: UserLog[]
  limit: number
}
