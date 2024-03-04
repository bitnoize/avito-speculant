import { sql } from 'kysely'
import { SubscriptionLog, SubscriptionLogData } from './subscription-log.js'
import { SubscriptionLogRow } from './subscription-log.table.js'
import { SubscriptionStatus } from '../subscription/subscription.js'
import { TransactionDatabase, Notify } from '../database.js'

export async function insertRow(
  trx: TransactionDatabase,
  subscription_id: number,
  action: string,
  categories_max: number,
  price_rub: number,
  duration_days: number,
  interval_sec: number,
  analytics_on: boolean,
  status: SubscriptionStatus,
  data: SubscriptionLogData
): Promise<SubscriptionLogRow> {
  return await trx
    .insertInto('subscription_log')
    .values(() => ({
      subscription_id,
      action,
      categories_max,
      price_rub,
      duration_days,
      interval_sec,
      analytics_on,
      status,
      data,
      created_at: sql`NOW()`
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

export const buildNotify = (row: SubscriptionLogRow): Notify => {
  return ['subscription', row.id, row.subscription_id, row.action]
}
