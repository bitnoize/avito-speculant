import { Generated, ColumnType, Selectable, Insertable, Updateable } from 'kysely'

export interface CategoryTable {
  id: Generated<number>
  user_id: ColumnType<number, number, never>
  avito_url: ColumnType<string, string, never>
  is_enabled: ColumnType<boolean, boolean, boolean | undefined>
  created_at: ColumnType<number, string, never>
  updated_at: ColumnType<number, string, string | undefined>
  scheduled_at: ColumnType<number, string, string | undefined>
}

export type CategoryRow = Selectable<CategoryTable>
export type InsertableCategoryRow = Insertable<CategoryTable>
export type UpdateableCategoryRow = Updateable<CategoryTable>
