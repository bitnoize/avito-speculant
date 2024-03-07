import { Generated, ColumnType, Selectable, Insertable, Updateable } from 'kysely'

export interface CategoryTable {
  id: Generated<number>
  user_id: ColumnType<number, number, never>
  avito_url: ColumnType<string, string, string | undefined>
  is_enabled: ColumnType<boolean, boolean, boolean | undefined>
  created_at: ColumnType<number, number, never>
  updated_at: ColumnType<number, number, number | undefined>
  queued_at: ColumnType<number, number, number | undefined>
}

export type CategoryRow = Selectable<CategoryTable>
export type InsertableCategoryRow = Insertable<CategoryTable>
export type UpdateableCategoryRow = Updateable<CategoryTable>
