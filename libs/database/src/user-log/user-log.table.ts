import { Generated, ColumnType, Selectable, Insertable } from 'kysely'
import { UserLogData } from './user-log.js'
import { UserStatus } from '../user/user.js'

export interface UserLogTable {
  id: Generated<string>
  user_id: ColumnType<number, number, never>
  action: ColumnType<string, string, never>
  status: ColumnType<UserStatus, UserStatus, never>
  subscriptions: ColumnType<number, number, never>
  categories: ColumnType<number, number, never>
  data: ColumnType<UserLogData, UserLogData, never>
  created_at: ColumnType<number, string, never>
}

export type UserLogRow = Selectable<UserLogTable>
export type InsertableUserLogRow = Insertable<UserLogTable>
