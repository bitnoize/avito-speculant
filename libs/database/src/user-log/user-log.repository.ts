import { Transaction, sql } from 'kysely'
import { PgPubSub, AnyJson } from '@imqueue/pg-pubsub'
import { UserLogRow, InsertableUserLogRow } from './user-log.table.js'
import { UserLog } from './user-log.js'
import { Database } from '../database.js'

export async function selectRowsByUserId(
  trx: Transaction<Database>,
  user_id: number,
  limit: number
): Promise<UserLogRow[]> {
  return await trx
    .selectFrom('user_log')
    .selectAll()
    .where('user_id', '=', user_id)
    .orderBy('created_at', 'desc')
    .limit(limit)
    .execute()
}

export async function insertRow(
  trx: Transaction<Database>,
  row: InsertableUserLogRow
): Promise<UserLogRow> {
  return await trx
    .insertInto('user_log')
    .values(() => ({
      ...row,
      created_at: sql`NOW()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function notify(pubSub: PgPubSub, row: UserLogRow): Promise<void> {
  await pubSub.notify('user', row as AnyJson)
}

export const buildModel = (row: UserLogRow): UserLog => {
  return {
    id: row.id,
    userId: row.user_id,
    action: row.action,
    status: row.status,
    subscriptions: row.subscriptions,
    data: row.data,
    createdAt: row.created_at
  }
}

export const buildCollection = (rows: UserLogRow[]): UserLog[] => {
  return rows.map((row) => buildModel(row))
}
