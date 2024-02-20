import { sql } from 'kysely'
import { User, UserStatus } from '@avito-speculant/domain'
import { UserRow } from './user.table.js'
import { TransactionDatabase } from '../database.js'

export async function selectRowByIdForShare(
  trx: TransactionDatabase,
  user_id: number
): Promise<UserRow | undefined> {
  return await trx
    .selectFrom('user')
    .selectAll()
    .where('id', '=', user_id)
    .forShare()
    .executeTakeFirst()
}

export async function selectRowByTgFromIdForShare(
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

export async function insertRow(
  trx: TransactionDatabase,
  tg_from_id: string
): Promise<UserRow> {
  return await trx
    .insertInto('user')
    .values(() => ({
      tg_from_id,
      status: 'trial',
      subscriptions: 0,
      categories: 0,
      created_at: sql`NOW()`,
      updated_at: sql`NOW()`,
      scheduled_at: sql`NOW()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function selectRowsList(
  trx: TransactionDatabase,
  all: boolean
): Promise<UserRow[]> {
  const filter = all
    ? ['trial', 'paid', 'block']
    : ['trial', 'paid']

  return await trx
    .selectFrom('user')
    .selectAll()
    .where('status', 'in', filter)
    .forShare()
    .orderBy('id', 'asc')
    .execute()
}

// FIXME
export async function selectRowsSkipLockedForUpdate(
  trx: TransactionDatabase,
  limit: number
): Promise<UserRow[]> {
  return await trx
    .selectFrom('user')
    .selectAll()
    .skipLocked()
    .forUpdate()
    .orderBy('scheduled_at', 'desc')
    .limit(limit)
    .execute()
}

export async function updateRowScheduleChange(
  trx: TransactionDatabase,
  user_id: number,
  status: UserStatus,
  subscriptions: number,
  categories: number
): Promise<UserRow> {
  return await trx
    .updateTable('user')
    .set(() => ({
      status,
      subscriptions,
      categories,
      updated_at: sql`NOW()`,
      scheduled_at: sql`NOW()`
    }))
    .where('id', '=', user_id)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateRowSchedule(
  trx: TransactionDatabase,
  user_id: number
): Promise<UserRow> {
  return await trx
    .updateTable('user')
    .set(() => ({
      scheduled_at: sql`NOW()`
    }))
    .where('id', '=', user_id)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export const buildModel = (row: UserRow): User => {
  return {
    id: row.id,
    tgFromId: row.tg_from_id,
    status: row.status,
    subscriptions: row.subscriptions,
    categories: row.categories,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    scheduledAt: row.scheduled_at
  }
}

export const buildCollection = (rows: UserRow[]): User[] => {
  return rows.map((row) => buildModel(row))
}
