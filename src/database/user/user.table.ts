import {
  ColumnType,
  Generated,
  Selectable,
  Insertable,
  Updateable
} from 'kysely'

export interface UserTable {
  id: Generated<number>
  tgFromId: ColumnType<string, string, never>
  createdAt: ColumnType<Date, string, never>
}

export type UserRow = Selectable<UserTable>
export type InsertableUserRow = Insertable<UserTable>
export type UpdateableUserRow = Updateable<UserTable>
