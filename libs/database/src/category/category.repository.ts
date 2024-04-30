import { sql } from 'kysely'
import { Category, CATEGORY_PRODUCE_AFTER } from './category.js'
import { CategoryRow } from './category.table.js'
import { TransactionDatabase } from '../database.js'

export async function selectRowById(
  trx: TransactionDatabase,
  category_id: number,
  writeLock: boolean = false
): Promise<CategoryRow | undefined> {
  const queryBase = trx
    .selectFrom('category')
    .selectAll()
    .where('id', '=', category_id)

  const queryLock = writeLock ? queryBase.forUpdate() : queryBase.forShare()

  return await queryLock.executeTakeFirst()
}

export async function selectRowByIdUserId(
  trx: TransactionDatabase,
  category_id: number,
  user_id: number,
  writeLock: boolean = false
): Promise<CategoryRow | undefined> {
  const queryBase = trx
    .selectFrom('category')
    .selectAll()
    .where('id', '=', category_id)
    .where('user_id', '=', user_id)

  const queryLock = writeLock ? queryBase.forUpdate() : queryBase.forShare()

  return await queryLock.executeTakeFirst()
}

export async function selectRowByBotId(
  trx: TransactionDatabase,
  bot_id: number
): Promise<CategoryRow | undefined> {
  return await trx
    .selectFrom('category')
    .selectAll()
    .where('bot_id', '=', bot_id)
    .forShare()
    .executeTakeFirst()
}

export async function selectRowByUserIdUrlPath(
  trx: TransactionDatabase,
  user_id: number,
  url_path: string
): Promise<CategoryRow | undefined> {
  return await trx
    .selectFrom('category')
    .selectAll()
    .where('user_id', '=', user_id)
    .where('url_path', '=', url_path)
    .forShare()
    .executeTakeFirst()
}

export async function selectRowsByUserId(
  trx: TransactionDatabase,
  user_id: number
): Promise<CategoryRow[]> {
  return await trx
    .selectFrom('category')
    .selectAll()
    .where('user_id', '=', user_id)
    .orderBy('created_at', 'desc')
    .forShare()
    .execute()
}

export async function selectCountByUserId(
  trx: TransactionDatabase,
  user_id: number
): Promise<number> {
  const { categories } = await trx
    .selectFrom('category')
    .select((eb) => eb.fn.countAll<number>().as('categories'))
    .where('user_id', '=', user_id)
    .where('is_enabled', 'is', true)
    .executeTakeFirstOrThrow()

  return categories
}

export async function insertRow(
  trx: TransactionDatabase,
  user_id: number,
  url_path: string
): Promise<CategoryRow> {
  return await trx
    .insertInto('category')
    .values(() => ({
      user_id,
      bot_id: null,
      url_path,
      is_enabled: false,
      created_at: sql<number>`now()`,
      updated_at: sql<number>`now()`,
      queued_at: sql<number>`now()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateRowState(
  trx: TransactionDatabase,
  category_id: number,
  bot_id: number | null,
  is_enabled: boolean
): Promise<CategoryRow> {
  return await trx
    .updateTable('category')
    .set(() => ({
      bot_id,
      is_enabled,
      updated_at: sql<number>`now()`
    }))
    .where('id', '=', category_id)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function selectRowsProduce(
  trx: TransactionDatabase,
  limit: number
): Promise<CategoryRow[]> {
  return await trx
    .selectFrom('category')
    .selectAll()
    .where('queued_at', '<', sql<number>`now() - interval '${CATEGORY_PRODUCE_AFTER}'`)
    .orderBy('queued_at', 'asc')
    .limit(limit)
    .forUpdate()
    .skipLocked()
    .execute()
}

export async function updateRowsProduce(
  trx: TransactionDatabase,
  category_ids: number[]
): Promise<CategoryRow[]> {
  return await trx
    .updateTable('category')
    .set(() => ({
      queued_at: sql<number>`now()`
    }))
    .where('id', 'in', category_ids)
    .returningAll()
    .execute()
}

export const buildModel = (row: CategoryRow): Category => {
  return {
    id: row.id,
    userId: row.user_id,
    botId: row.bot_id,
    urlPath: row.url_path,
    isEnabled: row.is_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    queuedAt: row.queued_at
  }
}

export const buildCollection = (rows: CategoryRow[]): Category[] => {
  return rows.map((row) => buildModel(row))
}
