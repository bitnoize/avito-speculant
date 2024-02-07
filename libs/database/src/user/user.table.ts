import { Generated, ColumnType, Selectable, Insertable, Updateable } from 'kysely'
import { UserStatus } from './user.js'

export interface UserTable {
  id: Generated<number>
  tg_from_id: ColumnType<string, string, never>
  status: ColumnType<UserStatus, never, never>
  subscriptions: ColumnType<number, never, never>
  create_time: ColumnType<Date, never, never>
  update_time: ColumnType<Date, never, never>
  process_time: ColumnType<Date, never, never>
}

export type UserRow = Selectable<UserTable>
export type InsertableUserRow = Insertable<UserTable>
export type UpdateableUserRow = Updateable<UserTable>
