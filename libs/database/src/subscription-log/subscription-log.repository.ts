import { Transaction, sql } from 'kysely'
import { PgPubSub, AnyJson } from '@imqueue/pg-pubsub'
// SubscriptionLog
import { SubscriptionLog } from './subscription-log.js'
import {
  SubscriptionLogRow,
  InsertableSubscriptionLogRow
} from './subscription-log.table.js'
// Database
import { Database } from '../database.js'

export async function selectRowsBySubscriptionId(
  trx: Transaction<Database>,
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

export async function insertRow(
  trx: Transaction<Database>,
  row: InsertableSubscriptionLogRow
): Promise<SubscriptionLogRow> {
  return await trx
    .insertInto('subscription_log')
    .values(() => ({
      ...row,
      created_at: sql`NOW()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function notify(
  pubSub: PgPubSub,
  subscriptionLogRow: SubscriptionLogRow
): Promise<void> {
  await pubSub.notify('subscription', subscriptionLogRow as AnyJson)
}

export const buildModel = (row: SubscriptionLogRow): SubscriptionLog => {
  return {
    id: row.id,
    subscriptionId: row.subscription_id,
    action: row.action,
    categoriesMax: row.categories_max,
    priceRub: row.price_rub,
    durationDays: row.duration_days,
    intervalSec: row.interval_sec,
    analyticsOn: row.analytics_on,
    status: row.status,
    data: row.data,
    createdAt: row.created_at
  }
}

export const buildCollection = (rows: SubscriptionLogRow[]): SubscriptionLog[] => {
  return rows.map((row) => buildModel(row))
}
