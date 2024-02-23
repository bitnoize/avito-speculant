import { sql } from 'kysely'
import { Category } from '@avito-speculant/domain'
import { CategoryRow } from './category.table.js'
import { TransactionDatabase } from '../database.js'

export async function selectRowByIdForShare(
  trx: TransactionDatabase,
  category_id: number
): Promise<CategoryRow | undefined> {
  return await trx
    .selectFrom('category')
    .selectAll()
    .where('id', '=', category_id)
    .forShare()
    .executeTakeFirst()
}

export async function selectRowByIdUserIdForUpdate(
  trx: TransactionDatabase,
  category_id: number,
  user_id: number
): Promise<CategoryRow | undefined> {
  return await trx
    .selectFrom('category')
    .selectAll()
    .where('id', '=', category_id)
    .where('user_id', '=', user_id)
    .forUpdate()
    .executeTakeFirst()
}

export async function insertRow(
  trx: TransactionDatabase,
  user_id: number,
  avito_url: string
): Promise<CategoryRow> {
  return await trx
    .insertInto('category')
    .values(() => ({
      user_id,
      avito_url,
      is_enabled: false,
      created_at: sql`NOW()`,
      updated_at: sql`NOW()`,
      queued_at: sql`NOW()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateRow(
  trx: TransactionDatabase,
  category_id: number,
  avito_url?: string
): Promise<CategoryRow> {
  return await trx
    .updateTable('category')
    .set(() => ({
      avito_url,
      updated_at: sql`NOW()`
    }))
    .where('id', '=', category_id)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateRowIsEnabled(
  trx: TransactionDatabase,
  category_id: number,
  is_enabled: boolean
): Promise<CategoryRow> {
  return await trx
    .updateTable('category')
    .set(() => ({
      is_enabled,
      updated_at: sql`NOW()`
    }))
    .where('id', '=', category_id)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function selectRowsList(
  trx: TransactionDatabase,
  user_id: number,
  all: boolean
): Promise<CategoryRow[]> {
  const filter = all ? [true, false] : [true]

  return await trx
    .selectFrom('category')
    .selectAll()
    .where('user_id', '=', user_id)
    .where('is_enabled', 'in', filter)
    .forShare()
    .orderBy('id', 'asc')
    .execute()
}

export async function selectCountByUserId(
  trx: TransactionDatabase,
  user_id: number
): Promise<{ categories: number }> {
  return await trx
    .selectFrom('category')
    .select((eb) => eb.fn.countAll<number>().as('categories'))
    .where('user_id', '=', user_id)
    .where('is_enabled', 'is', true)
    .executeTakeFirstOrThrow()
}

// FIXME
export async function selectRowsSkipLockedForUpdate(
  trx: TransactionDatabase,
  limit: number
): Promise<CategoryRow[]> {
  return await trx
    .selectFrom('category')
    .selectAll()
    .skipLocked()
    .forUpdate()
    .orderBy('queued_at', 'desc')
    .limit(limit)
    .execute()
}

export async function updateRowQueuedAt(
  trx: TransactionDatabase,
  category_id: number
): Promise<CategoryRow> {
  return await trx
    .updateTable('category')
    .set(() => ({
      queued_at: sql`NOW()`
    }))
    .where('id', '=', category_id)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateRowProcess(
  trx: TransactionDatabase,
  category_id: number,
  is_enabled: boolean
): Promise<CategoryRow> {
  return await trx
    .updateTable('category')
    .set(() => ({
      is_enabled,
      updated_at: sql`NOW()`,
      queued_at: sql`NOW()`
    }))
    .where('id', '=', category_id)
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
    queuedAt: row.queued_at
  }
}

export const buildCollection = (rows: CategoryRow[]): Category[] => {
  return rows.map((row) => buildModel(row))
}
