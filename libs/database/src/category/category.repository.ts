import { Transaction, sql } from 'kysely'
import { Category } from '@avito-speculant/domain'
import { UserRow } from '../user/user.table.js'
import {
  CategoryRow,
  InsertableCategoryRow,
  UpdateableCategoryRow
} from './category.table.js'
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
      ...normalizeCategoryRow(userRow, avito_url),
      is_enabled: sql.val(false),
      create_time: sql.val('NOW()'),
      update_time: sql.val('NOW()'),
      process_time: sql.val('NOW()')
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

const normalizeCategoryRow = (
  userRow: UserRow,
  avito_url: string,
): InsertableCategoryRow => {
  return {
    user_id: userRow.id,
    avito_url,
  }
}
