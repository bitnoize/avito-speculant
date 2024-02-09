import { Transaction, sql } from 'kysely'
import {
  SubscriptionRow,
  InsertableSubscriptionRow,
  UpdateableSubscriptionRow
} from './subscription.table.js'
import { Subscription, SubscriptionStatus } from './subscription.js'
import { Database } from '../database.js'

export async function insertRow(
  trx: Transaction<Database>,
  row: InsertableSubscriptionRow
): Promise<SubscriptionRow> {
  return await trx
    .insertInto('subscription')
    .values(() => ({
      ...row,
      status: 'wait',
      create_time: sql`NOW()`,
      update_time: sql`NOW()`,
      process_time: sql`NOW()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function selectRowByIdForShare(
  trx: Transaction<Database>,
  subscription_id: number
): Promise<SubscriptionRow | undefined> {
  return await trx
    .selectFrom('subscription')
    .selectAll()
    .where('id', '=', subscription_id)
    .forShare()
    .executeTakeFirst()
}

export async function selectRowByUserIdStatusWaitForShare(
  trx: Transaction<Database>,
  user_id: number
): Promise<SubscriptionRow | undefined> {
  return await trx
    .selectFrom('subscription')
    .selectAll()
    .where('user_id', '=', user_id)
    .where('status', '=', 'wait')
    .forShare()
    .executeTakeFirst()
}

export const buildModel = (row: SubscriptionRow): Subscription => {
  return {
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id,
    categoriesMax: row.categories_max,
    priceRub: row.price_rub,
    durationDays: row.duration_days,
    intervalSec: row.interval_sec,
    analyticsOn: row.analytics_on,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    scheduledAt: row.scheduled_at
  }
}

export const buildCollection = (rows: SubscriptionRow[]): Subscription[] => {
  return rows.map((row) => buildModel(row))
}
