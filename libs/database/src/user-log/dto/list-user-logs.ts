import { UserLog } from '../user-log.js'

export interface ListUserLogsRequest {
  userId: number
  limit?: number
}

export interface ListUserLogsResponse {
  userLogs: UserLog[]
  limit: number
}
