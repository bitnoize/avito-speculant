import { sql } from 'kysely'
import { Notify } from '@avito-speculant/common'
import { CategoryLog, CategoryLogData } from './category-log.js'
import { CategoryLogRow } from './category-log.table.js'
import { TransactionDatabase } from '../database.js'

export async function insertRow(
  trx: TransactionDatabase,
  category_id: number,
  action: string,
  is_enabled: boolean,
  data: CategoryLogData
): Promise<CategoryLogRow> {
  return await trx
    .insertInto('category_log')
    .values(() => ({
      category_id,
      action,
      is_enabled,
      data,
      created_at: sql<number>`now()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function selectRowsList(
  trx: TransactionDatabase,
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

export const buildModel = (row: CategoryLogRow): CategoryLog => {
  return {
    id: row.id,
    categoryId: row.category_id,
    action: row.action,
    isEnabled: row.is_enabled,
    data: row.data,
    createdAt: row.created_at
  }
}

export const buildCollection = (rows: CategoryLogRow[]): CategoryLog[] => {
  return rows.map((row) => buildModel(row))
}

export const buildNotify = (row: CategoryLogRow): Notify => {
  return ['category', row.id, row.category_id, row.action]
}
