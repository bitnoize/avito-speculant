import { Notify, User, UserLogData } from '@avito-speculant/domain'

export interface ScheduleUsersRequest {
  limit: number
  data: UserLogData
}

export interface ScheduleUsersResponse {
  message: string
  statusCode: number
  users: User[]
  backLog: Notify[]
}
