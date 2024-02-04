import { UserTable } from './user/user.table.js'
import { UserLogTable } from './user-log/user-log.table.js'

export type DatabaseConfig = {
  POSTGRES_HOST: string
  POSTGRES_PORT: number
  POSTGRES_DATABASE: string
  POSTGRES_USERNAME?: string
  POSTGRES_PASSWORD?: string
}

export interface Database {
  user: UserTable
  user_log: UserLogTable
}
