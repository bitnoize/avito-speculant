import { Transaction, sql } from 'kysely'
import { SubscriptionLog, SubscriptionLogData } from '@avito-speculant/domain'
import { SubscriptionRow } from '../subscription/subscription.table.js'
import {
  SubscriptionLogRow,
  InsertableSubscriptionLogRow
} from './subscription-log.table.js'
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
  action: string,
  subscriptionRow: SubscriptionRow,
  data: SubscriptionLogData
): Promise<SubscriptionLogRow> {
  return await trx
    .insertInto('subscription_log')
    .values(() => ({
      ...normalizeLogRow(action, subscriptionRow, data),
      created_at: sql.val('NOW()')
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
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

export const buildNotify = (row: SubscriptionLogRow): string => {
  return JSON.stringify(buildModel(row))
}

const normalizeLogRow = (
  action: string,
  subscriptionRow: SubscriptionRow,
  data: SubscriptionLogData
): InsertableSubscriptionLogRow => {
  return {
    subscription_id: subscriptionRow.id,
    action,
    categories_max: subscriptionRow.categories_max,
    price_rub: subscriptionRow.price_rub,
    duration_days: subscriptionRow.duration_days,
    interval_sec: subscriptionRow.interval_sec,
    analytics_on: subscriptionRow.analytics_on,
    status: subscriptionRow.status,
    data
  }
}
