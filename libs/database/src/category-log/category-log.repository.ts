import { Transaction, sql } from 'kysely'
import { PgPubSub, AnyJson } from '@imqueue/pg-pubsub'
// CategoryLog
import { CategoryLog } from './category-log.js'
import { CategoryLogRow, InsertableCategoryLogRow } from './category-log.table.js'
// Database
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
  row: InsertableCategoryLogRow
): Promise<CategoryLogRow> {
  return await trx
    .insertInto('category_log')
    .values(() => ({
      ...row,
      created_at: sql`NOW()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function notify(
  pubSub: PgPubSub,
  categoryLogRow: CategoryLogRow
): Promise<void> {
  await pubSub.notify('Category', categoryLogRow as AnyJson)
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
