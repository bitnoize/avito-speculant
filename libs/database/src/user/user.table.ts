import { Generated, ColumnType, Selectable, Insertable, Updateable } from 'kysely'
import { UserStatus } from './user.js'

export interface UserTable {
  id: Generated<number>
  tg_from_id: ColumnType<string, string, never>
  status: ColumnType<UserStatus, UserStatus | undefined, UserStatus | undefined>
  subscriptions: ColumnType<number, number | undefined, undefined>
  created_at: ColumnType<number, undefined, never>
  updated_at: ColumnType<number, undefined, undefined>
  scheduled_at: ColumnType<number, undefined, undefined>
}

export type UserRow = Selectable<UserTable>
export type InsertableUserRow = Insertable<UserTable>
export type UpdateableUserRow = Updateable<UserTable>
