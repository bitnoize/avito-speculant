import { sql } from 'kysely'
import {
  SubscriptionStatus,
  Subscription,
  SUBSCRIPTION_TIMEOUT_AFTER,
  SUBSCRIPTION_PRODUCE_AFTER
} from './subscription.js'
import { SubscriptionRow } from './subscription.table.js'
import { TransactionDatabase } from '../database.js'

export async function selectRowById(
  trx: TransactionDatabase,
  subscription_id: number,
  writeLock: boolean = false
): Promise<SubscriptionRow | undefined> {
  const queryBase = trx
    .selectFrom('subscription')
    .selectAll()
    .where('id', '=', subscription_id)

  const queryLock = writeLock ? queryBase.forUpdate() : queryBase.forShare()

  return await queryLock.executeTakeFirst()
}

export async function selectRowByIdUserId(
  trx: TransactionDatabase,
  subscription_id: number,
  user_id: number,
  writeLock: boolean = false
): Promise<SubscriptionRow | undefined> {
  const queryBase = trx
    .selectFrom('subscription')
    .selectAll()
    .where('id', '=', subscription_id)
    .where('user_id', '=', user_id)

  const queryLock = writeLock ? queryBase.forUpdate() : queryBase.forShare()

  return await queryLock.executeTakeFirst()
}

export async function selectRowByUserIdStatus(
  trx: TransactionDatabase,
  user_id: number,
  status: 'wait' | 'active',
  writeLock: boolean = false
): Promise<SubscriptionRow | undefined> {
  const queryBase = trx
    .selectFrom('subscription')
    .selectAll()
    .where('user_id', '=', user_id)
    .where('status', '=', status)

  const queryLock = writeLock ? queryBase.forUpdate() : queryBase.forShare()

  return await queryLock.executeTakeFirst()
}

export async function selectRowsByUserId(
  trx: TransactionDatabase,
  user_id: number
): Promise<SubscriptionRow[]> {
  return await trx
    .selectFrom('subscription')
    .selectAll()
    .where('user_id', '=', user_id)
    .where('status', 'in', ['wait', 'active', 'finish'])
    .orderBy('created_at', 'desc')
    .forShare()
    .execute()
}

export async function selectCountByUserId(
  trx: TransactionDatabase,
  user_id: number
): Promise<number> {
  const { subscriptions } = await trx
    .selectFrom('subscription')
    .select((eb) => eb.fn.countAll<number>().as('subscriptions'))
    .where('user_id', '=', user_id)
    .where('status', 'in', ['active', 'finish'])
    .executeTakeFirstOrThrow()

  return subscriptions
}

export async function selectCountByPlanId(
  trx: TransactionDatabase,
  plan_id: number
): Promise<number> {
  const { subscriptions } = await trx
    .selectFrom('subscription')
    .select((eb) => eb.fn.countAll<number>().as('subscriptions'))
    .where('plan_id', '=', plan_id)
    .where('status', 'in', ['active', 'finish'])
    .executeTakeFirstOrThrow()

  return subscriptions
}

export async function insertRow(
  trx: TransactionDatabase,
  user_id: number,
  plan_id: number,
  duration_days: number,
  price_rub: number
): Promise<SubscriptionRow> {
  return await trx
    .insertInto('subscription')
    .values(() => ({
      user_id,
      plan_id,
      price_rub,
      status: 'wait',
      created_at: sql<number>`now()`,
      updated_at: sql<number>`now()`,
      queued_at: sql<number>`now()`,
      timeout_at: sql<number>`now() + interval '${SUBSCRIPTION_TIMEOUT_AFTER}'`,
      finish_at: sql<number>`now() + interval '${duration_days} days'`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateRowState(
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

export async function selectRowsProduce(
  trx: TransactionDatabase,
  limit: number
): Promise<SubscriptionRow[]> {
  return await trx
    .selectFrom('subscription')
    .selectAll()
    .where('queued_at', '<', sql<number>`now() - interval '${SUBSCRIPTION_PRODUCE_AFTER}'`)
    .orderBy('queued_at', 'desc')
    .limit(limit)
    .forUpdate()
    .skipLocked()
    .execute()
}

export async function updateRowsProduce(
  trx: TransactionDatabase,
  subscription_ids: number[]
): Promise<SubscriptionRow[]> {
  return await trx
    .updateTable('subscription')
    .set(() => ({
      queued_at: sql<number>`now()`
    }))
    .where('id', 'in', subscription_ids)
    .returningAll()
    .execute()
}

export const buildModel = (row: SubscriptionRow): Subscription => {
  return {
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id,
    priceRub: row.price_rub,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    queuedAt: row.queued_at,
    timeoutAt: row.timeout_at,
    finishAt: row.finish_at
  }
}

export const buildCollection = (rows: SubscriptionRow[]): Subscription[] => {
  return rows.map((row) => buildModel(row))
}
