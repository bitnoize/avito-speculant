import { Generated, ColumnType, Selectable, Insertable, Updateable } from 'kysely'
import { UserStatus } from '@avito-speculant/domain'

export interface UserTable {
  id: Generated<number>
  tg_from_id: ColumnType<string, string, never>
  status: ColumnType<UserStatus, UserStatus, UserStatus | undefined>
  subscriptions: ColumnType<number, number, number | undefined>
  categories: ColumnType<number, number, number | undefined>
  created_at: ColumnType<number, string, never>
  updated_at: ColumnType<number, string, string | undefined>
  scheduled_at: ColumnType<number, string, string | undefined>
}

export type UserRow = Selectable<UserTable>
export type InsertableUserRow = Insertable<UserTable>
export type UpdateableUserRow = Updateable<UserTable>
