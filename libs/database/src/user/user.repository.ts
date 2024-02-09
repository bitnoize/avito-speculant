import { Transaction, sql } from 'kysely'
// User
import { UserRow, InsertableUserRow, UpdateableUserRow } from './user.table.js'
import { User } from './user.js'
// Database
import { Database } from '../database.js'

export async function selectRowByIdForShare(
  trx: Transaction<Database>,
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
  trx: Transaction<Database>,
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
  trx: Transaction<Database>,
  row: InsertableUserRow
): Promise<UserRow> {
  return await trx
    .insertInto('user')
    .values((eb) => ({
      ...row,
      status: 'trial',
      subscriptions: 0,
      created_at: sql`NOW()`,
      updated_at: sql`NOW()`,
      scheduled_at: sql`NOW()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateBlockStatusRow(
  trx: Transaction<Database>,
  user_id: number
): Promise<UserRow> {
  return await trx
    .updateTable('user')
    .set((eb) => ({
      status: 'block',
      updated_at: sql`NOW()`
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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    scheduledAt: row.scheduled_at
  }
}

export const buildCollection = (rows: UserRow[]): User[] => {
  return rows.map((row) => buildModel(row))
}
