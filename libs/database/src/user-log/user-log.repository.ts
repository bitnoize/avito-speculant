import { sql } from 'kysely'
import { UserLog, UserLogData } from '@avito-speculant/domain'
import { UserRow } from '../user/user.table.js'
import { UserLogRow } from './user-log.table.js'
import { TransactionDatabase } from '../database.js'

export async function selectRowsByUserId(
  trx: TransactionDatabase,
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
  trx: TransactionDatabase,
  action: string,
  userRow: UserRow,
  data: UserLogData
): Promise<UserLogRow> {
  return await trx
    .insertInto('user_log')
    .values(() => ({
      user_id: userRow.id,
      action,
      status: userRow.status,
      subscriptions: userRow.subscriptions,
      data,
      created_at: sql`NOW()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
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

export const buildNotify = (row: UserLogRow): string => {
  return JSON.stringify(buildModel(row))
}
