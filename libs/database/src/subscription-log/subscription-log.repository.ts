import { sql } from 'kysely'
import { Notify } from '@avito-speculant/notify'
import { SubscriptionLog, SubscriptionLogData } from './subscription-log.js'
import { SubscriptionLogRow } from './subscription-log.table.js'
import { SubscriptionStatus } from '../subscription/subscription.js'
import { TransactionDatabase } from '../database.js'

export async function insertRow(
  trx: TransactionDatabase,
  subscription_id: number,
  action: string,
  status: SubscriptionStatus,
  data: SubscriptionLogData
): Promise<SubscriptionLogRow> {
  return await trx
    .insertInto('subscription_log')
    .values(() => ({
      subscription_id,
      action,
      status,
      data,
      created_at: sql<number>`now()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function selectRowsList(
  trx: TransactionDatabase,
  subscription_id: number,
  limit: number
): Promise<SubscriptionLogRow[]> {
  return await trx
    .selectFrom('subscription_log')
    .selectAll()
    .where('subscription_id', '=', subscription_id)
    .orderBy('created_at', 'desc')
    .limit(limit)
    .execute()
}

export const buildModel = (row: SubscriptionLogRow): SubscriptionLog => {
  return {
    id: row.id,
    subscriptionId: row.subscription_id,
    action: row.action,
    status: row.status,
    data: row.data,
    createdAt: row.created_at
  }
}

export const buildCollection = (rows: SubscriptionLogRow[]): SubscriptionLog[] => {
  return rows.map((row) => buildModel(row))
}

export const buildNotify = (row: SubscriptionLogRow): Notify => {
  return ['subscription', row.id, row.subscription_id, row.action]
}
