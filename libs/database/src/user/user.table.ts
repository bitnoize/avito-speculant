import { ColumnType, Generated, Selectable, Insertable, Updateable } from 'kysely'
import { UserStatus } from './user.js'

export interface UserTable {
  id: Generated<number>
  tg_from_id: ColumnType<string, string, never>
  status: ColumnType<UserStatus, never, UserStatus>
  created_at: ColumnType<Date, never, never>
  updated_at: ColumnType<Date, never, string | undefined>
}

export type UserRow = Selectable<UserTable>
export type InsertableUserRow = Insertable<UserTable>
export type UpdateableUserRow = Updateable<UserTable>
