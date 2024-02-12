import { Generated, ColumnType, Selectable, Insertable } from 'kysely'
import { CategoryLogData } from '@avito-speculant/domain'

export interface CategoryLogTable {
  id: Generated<string>
  category_id: ColumnType<number, number, never>
  action: ColumnType<string, string, never>
  avito_url: ColumnType<string, string, never>
  is_enabled: ColumnType<boolean, boolean, never>
  data: ColumnType<CategoryLogData, CategoryLogData, never>
  created_at: ColumnType<number, string, never>
}

export type CategoryLogRow = Selectable<CategoryLogTable>
export type InsertableCategoryLogRow = Insertable<CategoryLogTable>
