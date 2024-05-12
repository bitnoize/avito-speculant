import { Generated, ColumnType, Selectable, Insertable, Updateable } from 'kysely'

export interface UserTable {
  id: Generated<number>
  tg_from_id: ColumnType<string, string, never>
  active_subscription_id: ColumnType<number | null, null, number | null | undefined>
  subscriptions: ColumnType<number, number, number | undefined>
  categories: ColumnType<number, number, number | undefined>
  bots: ColumnType<number, number, number | undefined>
  created_at: ColumnType<number, number, never>
  updated_at: ColumnType<number, number, number | undefined>
  queued_at: ColumnType<number, number, number | undefined>
}

export type UserRow = Selectable<UserTable>
export type InsertableUserRow = Insertable<UserTable>
export type UpdateableUserRow = Updateable<UserTable>
