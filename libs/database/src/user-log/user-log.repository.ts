import { sql } from 'kysely'
import { UserLog, UserLogData } from './user-log.js'
import { UserLogRow } from './user-log.table.js'
import { UserStatus } from '../user/user.js'
import { TransactionDatabase, Notify } from '../database.js'

export async function insertRow(
  trx: TransactionDatabase,
  user_id: number,
  action: string,
  status: UserStatus,
  subscriptions: number,
  categories: number,
  data: UserLogData
): Promise<UserLogRow> {
  return await trx
    .insertInto('user_log')
    .values(() => ({
      user_id,
      action,
      status,
      subscriptions,
      categories,
      data,
      created_at: sql`NOW()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function selectRowsList(
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

export const buildModel = (row: UserLogRow): UserLog => {
  return {
    id: row.id,
    userId: row.user_id,
    action: row.action,
    status: row.status,
    subscriptions: row.subscriptions,
    categories: row.categories,
    data: row.data,
    createdAt: row.created_at
  }
}

export const buildCollection = (rows: UserLogRow[]): UserLog[] => {
  return rows.map((row) => buildModel(row))
}

export const buildNotify = (row: UserLogRow): Notify => {
  return ['user', row.id, row.user_id, row.action]
}
