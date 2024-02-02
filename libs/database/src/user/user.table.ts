import { ColumnType, Generated, Selectable, Insertable, Updateable } from 'kysely'

export interface UserTable {
  id: Generated<number>
  tg_from_id: ColumnType<string, string, never>
  first_name: string
  last_name: string | null
  username: string | null
  language_code: string | null
  created_at: ColumnType<Date, never, never>
  updated_at: ColumnType<Date, never, string | undefined>
}

export type UserRow = Selectable<UserTable>
export type InsertableUserRow = Insertable<UserTable>
export type UpdateableUserRow = Updateable<UserTable>
