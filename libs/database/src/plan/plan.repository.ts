import { sql } from 'kysely'
import { Plan, PLAN_PRODUCE_AFTER } from './plan.js'
import { PlanRow } from './plan.table.js'
import { TransactionDatabase } from '../database.js'

export async function selectRowById(
  trx: TransactionDatabase,
  plan_id: number,
  writeLock = false
): Promise<PlanRow | undefined> {
  const queryBase = trx.selectFrom('plan').selectAll().where('id', '=', plan_id)

  const queryLock = writeLock ? queryBase.forUpdate() : queryBase.forShare()

  return await queryLock.executeTakeFirst()
}

export async function selectRowByUnique(
  trx: TransactionDatabase,
  categories_max: number,
  duration_days: number,
  interval_sec: number,
  analytics_on: boolean
): Promise<PlanRow | undefined> {
  return await trx
    .selectFrom('plan')
    .selectAll()
    .where('categories_max', '=', categories_max)
    .where('duration_days', '=', duration_days)
    .where('interval_sec', '=', interval_sec)
    .where('analytics_on', '=', analytics_on)
    .forShare()
    .executeTakeFirst()
}

export async function insertRow(
  trx: TransactionDatabase,
  categories_max: number,
  duration_days: number,
  interval_sec: number,
  analytics_on: boolean,
  price_rub: number
): Promise<PlanRow> {
  return await trx
    .insertInto('plan')
    .values(() => ({
      categories_max,
      duration_days,
      interval_sec,
      analytics_on,
      price_rub,
      is_enabled: false,
      subscriptions: 0,
      created_at: sql<number>`now()`,
      updated_at: sql<number>`now()`,
      queued_at: sql<number>`now()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateRowPriceRub(
  trx: TransactionDatabase,
  plan_id: number,
  price_rub: number
): Promise<PlanRow> {
  return await trx
    .updateTable('plan')
    .set(() => ({
      price_rub,
      updated_at: sql<number>`now()`
    }))
    .where('id', '=', plan_id)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateRowState(
  trx: TransactionDatabase,
  plan_id: number,
  is_enabled: boolean
): Promise<PlanRow> {
  return await trx
    .updateTable('plan')
    .set(() => ({
      is_enabled,
      updated_at: sql<number>`now()`
    }))
    .where('id', '=', plan_id)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function selectRowsProduce(
  trx: TransactionDatabase,
  limit: number
): Promise<PlanRow[]> {
  return await trx
    .selectFrom('plan')
    .selectAll()
    .where('queued_at', '<', sql<number>`now() - ${PLAN_PRODUCE_AFTER}::interval`)
    .orderBy('queued_at', 'asc')
    .limit(limit)
    .forUpdate()
    .skipLocked()
    .execute()
}

export async function updateRowsProduce(
  trx: TransactionDatabase,
  plan_ids: number[]
): Promise<PlanRow[]> {
  if (plan_ids.length === 0) {
    return []
  }

  return await trx
    .updateTable('plan')
    .set(() => ({
      queued_at: sql<number>`now()`
    }))
    .where('id', 'in', plan_ids)
    .returningAll()
    .execute()
}

export async function updateRowCounters(
  trx: TransactionDatabase,
  plan_id: number,
  subscriptions: number
): Promise<void> {
  await trx
    .updateTable('plan')
    .set(() => ({
      subscriptions
    }))
    .where('id', '=', plan_id)
    .execute()
}

export const buildModel = (row: PlanRow): Plan => {
  return {
    id: row.id,
    categoriesMax: row.categories_max,
    durationDays: row.duration_days,
    intervalSec: row.interval_sec,
    analyticsOn: row.analytics_on,
    priceRub: row.price_rub,
    isEnabled: row.is_enabled,
    subscriptions: row.subscriptions,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    queuedAt: row.queued_at
  }
}

export const buildCollection = (rows: PlanRow[]): Plan[] => {
  return rows.map((row) => buildModel(row))
}
