import { Transaction, sql } from 'kysely'
import {
  CategoryRow,
  InsertableCategoryRow,
  UpdateableCategoryRow
} from './category.table.js'
import { Category } from './category.js'
import { Database } from '../database.js'

export async function insertRow(
  trx: Transaction<Database>,
  row: InsertableCategoryRow
): Promise<CategoryRow> {
  return await trx
    .insertInto('category')
    .values(() => ({
      ...row,
      is_enabled: false,
      create_time: sql`NOW()`,
      update_time: sql`NOW()`,
      process_time: sql`NOW()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function selectRowByIdForShare(
  trx: Transaction<Database>,
  category_id: number
): Promise<CategoryRow | undefined> {
  return await trx
    .selectFrom('category')
    .selectAll()
    .where('id', '=', category_id)
    .forShare()
    .executeTakeFirst()
}

export const buildModel = (row: CategoryRow): Category => {
  return {
    id: row.id,
    userId: row.user_id,
    avitoUrl: row.avito_url,
    isEnabled: row.is_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    scheduledAt: row.scheduled_at
  }
}

export const buildCollection = (rows: CategoryRow[]): Category[] => {
  return rows.map((row) => buildModel(row))
}
