import { sql } from 'kysely'
import { Notify, CategoryLog, CategoryLogData } from '@avito-speculant/domain'
import { CategoryLogRow } from './category-log.table.js'
import { TransactionDatabase } from '../database.js'

export async function insertRow(
  trx: TransactionDatabase,
  category_id: number,
  action: string,
  avito_url: string,
  is_enabled: boolean,
  data: CategoryLogData
): Promise<CategoryLogRow> {
  return await trx
    .insertInto('category_log')
    .values(() => ({
      category_id,
      action,
      avito_url,
      is_enabled,
      data,
      created_at: sql`NOW()`
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
    avitoUrl: row.avito_url,
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
