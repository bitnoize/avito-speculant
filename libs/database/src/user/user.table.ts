import { Generated, ColumnType, Selectable, Insertable, Updateable } from 'kysely'
import { UserStatus } from './user.js'

export interface UserTable {
  id: Generated<number>
  tg_from_id: ColumnType<string, string, never>
  status: ColumnType<UserStatus, never, never>
  subscriptions: ColumnType<number, never, never>
  created_at: ColumnType<Date, never, never>
  updated_at: ColumnType<Date, never, never>
  scheduled_at: ColumnType<Date, never, never>
}

export type UserRow = Selectable<UserTable>
export type InsertableUserRow = Insertable<UserTable>
export type UpdateableUserRow = Updateable<UserTable>
