import { UserLog } from '../user-log.js'
import { DatabaseMethod } from '../../database.js'

export type ListUserLogsRequest = {
  userId: number
  limit: number
}

export type ListUserLogsResponse = {
  userLogs: UserLog[]
}

export type ListUserLogs = DatabaseMethod<ListUserLogsRequest, ListUserLogsResponse>
