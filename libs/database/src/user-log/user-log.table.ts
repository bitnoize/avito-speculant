import { Generated, ColumnType, Selectable, Insertable } from 'kysely'
import { UserStatus, UserData } from '../user/user.js'

export interface UserLogTable {
  id: Generated<string>
  user_id: ColumnType<number, number, never>
  time: ColumnType<Date, never, never>
  action: ColumnType<string, string, never>
  status: ColumnType<UserStatus, UserStatus, never>
  subscriptions: ColumnType<number, number , never>
  data: ColumnType<UserData, UserData, never>
}

export type UserLogRow = Selectable<UserLogTable>
export type InsertableUserLogRow = Insertable<UserLogTable>
