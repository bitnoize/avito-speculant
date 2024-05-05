import { sql } from 'kysely'
import { User, USER_PRODUCE_AFTER } from './user.js'
import { UserRow } from './user.table.js'
import { TransactionDatabase } from '../database.js'

export async function selectRowById(
  trx: TransactionDatabase,
  user_id: number,
  writeLock = false
): Promise<UserRow | undefined> {
  const queryBase = trx.selectFrom('user').selectAll().where('id', '=', user_id)

  const queryLock = writeLock ? queryBase.forUpdate() : queryBase.forShare()

  return await queryLock.executeTakeFirst()
}

export async function selectRowByTgFromId(
  trx: TransactionDatabase,
  tg_from_id: string
): Promise<UserRow | undefined> {
  return await trx
    .selectFrom('user')
    .selectAll()
    .where('tg_from_id', '=', tg_from_id)
    .forShare()
    .executeTakeFirst()
}

export async function selectRows(trx: TransactionDatabase): Promise<UserRow[]> {
  return await trx.selectFrom('user').selectAll().orderBy('created_at', 'asc').forShare().execute()
}

export async function insertRow(trx: TransactionDatabase, tg_from_id: string): Promise<UserRow> {
  return await trx
    .insertInto('user')
    .values(() => ({
      tg_from_id,
      is_paid: false,
      subscriptions: 0,
      categories: 0,
      bots: 0,
      created_at: sql<number>`now()`,
      updated_at: sql<number>`now()`,
      queued_at: sql<number>`now()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateRowState(
  trx: TransactionDatabase,
  user_id: number,
  is_paid: boolean
): Promise<UserRow> {
  return await trx
    .updateTable('user')
    .set(() => ({
      is_paid,
      updated_at: sql<number>`now()`
    }))
    .where('id', '=', user_id)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function selectRowsProduce(
  trx: TransactionDatabase,
  limit: number
): Promise<UserRow[]> {
  return await trx
    .selectFrom('user')
    .selectAll()
    .where('queued_at', '<', sql<number>`now() - ${USER_PRODUCE_AFTER}::interval`)
    .orderBy('queued_at', 'asc')
    .limit(limit)
    .forUpdate()
    .skipLocked()
    .execute()
}

export async function updateRowsProduce(
  trx: TransactionDatabase,
  user_ids: number[]
): Promise<UserRow[]> {
  if (user_ids.length === 0) {
    return []
  }

  return await trx
    .updateTable('user')
    .set(() => ({
      queued_at: sql<number>`now()`
    }))
    .where('id', 'in', user_ids)
    .returningAll()
    .execute()
}

export async function updateRowCounters(
  trx: TransactionDatabase,
  user_id: number,
  subscriptions: number,
  categories: number,
  bots: number
): Promise<void> {
  await trx
    .updateTable('user')
    .set(() => ({
      subscriptions,
      categories,
      bots
    }))
    .where('id', '=', user_id)
    .execute()
}

export const buildModel = (row: UserRow): User => {
  return {
    id: row.id,
    tgFromId: row.tg_from_id,
    isPaid: row.is_paid,
    subscriptions: row.subscriptions,
    categories: row.categories,
    bots: row.bots,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    queuedAt: row.queued_at
  }
}

export const buildCollection = (rows: UserRow[]): User[] => {
  return rows.map((row) => buildModel(row))
}
