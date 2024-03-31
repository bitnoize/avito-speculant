import { Generated, ColumnType, Selectable, Insertable } from 'kysely'
import { CategoryLogData } from './category-log.js'

export interface CategoryLogTable {
  id: Generated<string>
  category_id: ColumnType<number, number, never>
  action: ColumnType<string, string, never>
  is_enabled: ColumnType<boolean, boolean, never>
  data: ColumnType<CategoryLogData, CategoryLogData, never>
  created_at: ColumnType<number, number, never>
}

export type CategoryLogRow = Selectable<CategoryLogTable>
export type InsertableCategoryLogRow = Insertable<CategoryLogTable>
