import { Transaction, sql } from 'kysely'
import { CategoryLog, CategoryLogData } from '@avito-speculant/domain'
import { CategoryRow } from '../category/category.table.js'
import { CategoryLogRow, InsertableCategoryLogRow } from './category-log.table.js'
import { Database } from '../database.js'

export async function selectRowsByCategoryId(
  trx: Transaction<Database>,
  category_id: number,
  limit: number
): Promise<CategoryLogRow[]> {
  return await trx
    .selectFrom('category_log')
    .selectAll()
    .where('category_id', '=', category_id)
    .orderBy('created_at', 'desc')
    .limit(limit)
    .execute()
}

export async function insertRow(
  trx: Transaction<Database>,
  action: string,
  categoryRow: CategoryRow,
  data: CategoryLogData
): Promise<CategoryLogRow> {
  return await trx
    .insertInto('category_log')
    .values(() => ({
      ...normalizeLogRow(action, categoryRow, data),
      created_at: sql`NOW()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export const buildModel = (row: CategoryLogRow): CategoryLog => {
  return {
    id: row.id,
    categoryId: row.category_id,
    action: row.action,
    avitoUrl: row.avito_url,
    isEnabled: row.is_enabled,
    data: row.data,
    createdAt: row.created_at
  }
}

export const buildCollection = (rows: CategoryLogRow[]): CategoryLog[] => {
  return rows.map((row) => buildModel(row))
}

export const buildNotify = (row: CategoryLogRow): string => {
  return JSON.stringify(buildModel(row))
}

const normalizeLogRow = (
  action: string,
  categoryRow: CategoryRow,
  data: CategoryLogData
): InsertableCategoryLogRow => {
  return {
    category_id: categoryRow.id,
    action,
    avito_url: categoryRow.avito_url,
    is_enabled: categoryRow.is_enabled,
    data
  }
}
