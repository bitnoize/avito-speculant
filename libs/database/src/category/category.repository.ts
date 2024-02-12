import { Transaction, sql } from 'kysely'
import { Category } from '@avito-speculant/domain'
import { UserRow } from '../user/user.table.js'
import { CategoryRow } from './category.table.js'
import { Database } from '../database.js'

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

export async function insertRow(
  trx: Transaction<Database>,
  userRow: UserRow,
  avito_url: string
): Promise<CategoryRow> {
  return await trx
    .insertInto('category')
    .values(() => ({
      user_id: userRow.id,
      avito_url,
      is_enabled: false,
      created_at: sql`NOW()`,
      updated_at: sql`NOW()`,
      scheduled_at: sql`NOW()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
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
