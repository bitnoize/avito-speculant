import { sql } from 'kysely'
import { Notify } from '@avito-speculant/common'
import { UserLog, UserLogData } from './user-log.js'
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
    .forShare()
    .execute()
}

export async function insertRow(
  trx: TransactionDatabase,
  user_id: number,
  action: string,
  active_subscription_id: number | null,
  subscriptions: number,
  categories: number,
  bots: number,
  data: UserLogData
): Promise<UserLogRow> {
  return await trx
    .insertInto('user_log')
    .values(() => ({
      user_id,
      action,
      active_subscription_id,
      subscriptions,
      categories,
      bots,
      data,
      created_at: sql<number>`now()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export const buildModel = (row: UserLogRow): UserLog => {
  return {
    id: row.id,
    userId: row.user_id,
    action: row.action,
    activeSubscriptionId: row.active_subscription_id,
    subscriptions: row.subscriptions,
    categories: row.categories,
    bots: row.bots,
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
