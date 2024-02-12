import { Generated, ColumnType, Selectable, Insertable, Updateable } from 'kysely'
import { UserStatus } from '@avito-speculant/domain'

export interface UserTable {
  id: Generated<number>
  tg_from_id: ColumnType<string, string, never>
  status: ColumnType<UserStatus, UserStatus | undefined, UserStatus | undefined>
  subscriptions: ColumnType<number, number | undefined, number | undefined>
  created_at: ColumnType<number, string | undefined, never>
  updated_at: ColumnType<number, string | undefined, string | undefined>
  scheduled_at: ColumnType<number, string | undefined, string | undefined>
}

export type UserRow = Selectable<UserTable>
export type InsertableUserRow = Insertable<UserTable>
export type UpdateableUserRow = Updateable<UserTable>
