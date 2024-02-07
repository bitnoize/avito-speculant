import { Transaction, sql } from 'kysely'
import { UserLogRow, InsertableUserLogRow } from './user-log.table.js'
import { UserLog } from './user-log.js'
import { Database } from '../database.js'

export async function insertRow(
  trx: Transaction<Database>,
  row: InsertableUserLogRow
): Promise<void> {
  await trx
    .insertInto('user_log')
    .values(() => ({
      ...row,
      time: sql`NOW()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function selectRowsByUserId(
  trx: Transaction<Database>,
  user_id: number,
  limit: number
): Promise<UserLogRow[]> {
  return await trx
    .selectFrom('user_log')
    .selectAll()
    .where('user_id', '=', user_id)
    .orderBy('time', 'desc')
    .limit(limit)
    .execute()
}

export const buildModel = (row: UserLogRow): UserLog => {
  return {
    id: row.id,
    userId: row.user_id,
    time: row.time,
    action: row.action,
    status: row.status,
    subscriptions: row.subscriptions,
    data: row.data
  }
}

export const buildCollection = (rows: UserLogRow[]): UserLog[] => {
  return rows.map((row) => buildModel(row))
}
