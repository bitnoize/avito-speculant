import { sql } from 'kysely'
import { Subscription, SubscriptionStatus } from './subscription.js'
import { SubscriptionRow } from './subscription.table.js'
import { TransactionDatabase } from '../database.js'

export async function selectRowByIdForShare(
  trx: TransactionDatabase,
  subscription_id: number
): Promise<SubscriptionRow | undefined> {
  return await trx
    .selectFrom('subscription')
    .selectAll()
    .where('id', '=', subscription_id)
    .forShare()
    .executeTakeFirst()
}

export async function selectRowByIdForUpdate(
  trx: TransactionDatabase,
  subscription_id: number
): Promise<SubscriptionRow | undefined> {
  return await trx
    .selectFrom('subscription')
    .selectAll()
    .where('id', '=', subscription_id)
    .forUpdate()
    .executeTakeFirst()
}

export async function selectRowByUserIdStatusForShare(
  trx: TransactionDatabase,
  user_id: number,
  status: 'wait' | 'active' // FIXME
): Promise<SubscriptionRow | undefined> {
  return await trx
    .selectFrom('subscription')
    .selectAll()
    .where('user_id', '=', user_id)
    .where('status', '=', status)
    .forShare()
    .executeTakeFirst()
}

export async function insertRow(
  trx: TransactionDatabase,
  user_id: number,
  plan_id: number,
  categories_max: number,
  price_rub: number,
  duration_days: number,
  interval_sec: number,
  analytics_on: boolean
): Promise<SubscriptionRow> {
  return await trx
    .insertInto('subscription')
    .values(() => ({
      user_id,
      plan_id,
      categories_max,
      price_rub,
      duration_days,
      interval_sec,
      analytics_on,
      status: 'wait',
      created_at: sql<number>`now()`,
      updated_at: sql<number>`now()`,
      queued_at: sql<number>`now()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateRowStatus(
  trx: TransactionDatabase,
  subscription_id: number,
  status: SubscriptionStatus
): Promise<SubscriptionRow> {
  return await trx
    .updateTable('subscription')
    .set(() => ({
      status,
      updated_at: sql<number>`now()`
    }))
    .where('id', '=', subscription_id)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function selectRowsList(
  trx: TransactionDatabase,
  user_id: number,
  all: boolean
): Promise<SubscriptionRow[]> {
  const filter = all ? ['wait', 'cancel', 'active', 'finish'] : ['wait', 'active', 'finish']

  return await trx
    .selectFrom('subscription')
    .selectAll()
    .where('user_id', '=', user_id)
    .where('status', 'in', filter)
    .forShare()
    .orderBy('id', 'asc')
    .execute()
}

export async function selectCountByUserId(
  trx: TransactionDatabase,
  user_id: number
): Promise<{ subscriptions: number }> {
  return await trx
    .selectFrom('subscription')
    .select((eb) => eb.fn.countAll<number>().as('subscriptions'))
    .where('user_id', '=', user_id)
    .where('status', 'not in', ['wait', 'cancel'])
    .executeTakeFirstOrThrow()
}

export async function selectCountByPlanId(
  trx: TransactionDatabase,
  plan_id: number
): Promise<{ subscriptions: number }> {
  return await trx
    .selectFrom('subscription')
    .select((eb) => eb.fn.countAll<number>().as('subscriptions'))
    .where('plan_id', '=', plan_id)
    .where('status', 'not in', ['wait', 'cancel'])
    .executeTakeFirstOrThrow()
}

export async function selectRowsProduce(
  trx: TransactionDatabase,
  limit: number
): Promise<SubscriptionRow[]> {
  return await trx
    .selectFrom('subscription')
    .selectAll()
    .where('queued_at', '<', sql<number>`now() - interval '1 MINUTE'`)
    .orderBy('queued_at', 'desc')
    .forUpdate()
    .skipLocked()
    .limit(limit)
    .execute()
}

export async function updateRowProduce(
  trx: TransactionDatabase,
  subscription_id: number
): Promise<SubscriptionRow> {
  return await trx
    .updateTable('subscription')
    .set(() => ({
      queued_at: sql<number>`now()`
    }))
    .where('id', '=', subscription_id)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateRowConsume(
  trx: TransactionDatabase,
  subscription_id: number,
  status: SubscriptionStatus
): Promise<SubscriptionRow> {
  return await trx
    .updateTable('subscription')
    .set(() => ({
      status,
      updated_at: sql<number>`now()`
    }))
    .where('id', '=', subscription_id)
    .returningAll()
    .executeTakeFirstOrThrow()
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
    queuedAt: row.queued_at
  }
}

export const buildCollection = (rows: SubscriptionRow[]): Subscription[] => {
  return rows.map((row) => buildModel(row))
}
