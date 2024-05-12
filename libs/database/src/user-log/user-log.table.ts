import { Generated, ColumnType, Selectable, Insertable } from 'kysely'
import { UserLogData } from './user-log.js'

export interface UserLogTable {
  id: Generated<string>
  user_id: ColumnType<number, number, never>
  action: ColumnType<string, string, never>
  active_subscription_id: ColumnType<number | null, number | null, never>
  subscriptions: ColumnType<number, number, never>
  categories: ColumnType<number, number, never>
  bots: ColumnType<number, number, never>
  data: ColumnType<UserLogData, UserLogData, never>
  created_at: ColumnType<number, number, never>
}

export type UserLogRow = Selectable<UserLogTable>
export type InsertableUserLogRow = Insertable<UserLogTable>
