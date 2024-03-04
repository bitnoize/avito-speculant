import { sql } from 'kysely'
import { Plan } from './plan.js'
import { PlanRow } from './plan.table.js'
import { TransactionDatabase } from '../database.js'

export async function selectRowByIdForShare(
  trx: TransactionDatabase,
  plan_id: number
): Promise<PlanRow | undefined> {
  return await trx
    .selectFrom('plan')
    .selectAll()
    .where('id', '=', plan_id)
    .forShare()
    .executeTakeFirst()
}

export async function selectRowByIdForUpdate(
  trx: TransactionDatabase,
  plan_id: number
): Promise<PlanRow | undefined> {
  return await trx
    .selectFrom('plan')
    .selectAll()
    .where('id', '=', plan_id)
    .forUpdate()
    .executeTakeFirst()
}

export async function insertRow(
  trx: TransactionDatabase,
  categories_max: number,
  price_rub: number,
  duration_days: number,
  interval_sec: number,
  analytics_on: boolean
): Promise<PlanRow> {
  return await trx
    .insertInto('plan')
    .values(() => ({
      categories_max,
      price_rub,
      duration_days,
      interval_sec,
      analytics_on,
      is_enabled: false,
      subscriptions: 0,
      created_at: sql`NOW()`,
      updated_at: sql`NOW()`,
      queued_at: sql`NOW()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateRow(
  trx: TransactionDatabase,
  plan_id: number,
  categories_max?: number,
  price_rub?: number,
  duration_days?: number,
  interval_sec?: number,
  analytics_on?: boolean
): Promise<PlanRow> {
  return await trx
    .updateTable('plan')
    .set(() => ({
      categories_max,
      price_rub,
      duration_days,
      interval_sec,
      analytics_on,
      updated_at: sql`NOW()`
    }))
    .where('id', '=', plan_id)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateRowIsEnabled(
  trx: TransactionDatabase,
  plan_id: number,
  is_enabled: boolean
): Promise<PlanRow> {
  return await trx
    .updateTable('plan')
    .set(() => ({
      is_enabled,
      updated_at: sql`NOW()`
    }))
    .where('id', '=', plan_id)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function selectRowsList(trx: TransactionDatabase, all: boolean): Promise<PlanRow[]> {
  return await trx
    .selectFrom('plan')
    .selectAll()
    .where('is_enabled', 'in', all ? [true, false] : [true])
    .forShare()
    .orderBy('id', 'asc')
    .execute()
}

export async function selectRowsSkipLockedForUpdate(
  trx: TransactionDatabase,
  limit: number
): Promise<PlanRow[]> {
  return await trx
    .selectFrom('plan')
    .selectAll()
    .where('queued_at', '<', sql<number>`now() - interval '1 MINUTE'`)
    .orderBy('queued_at', 'desc')
    .forUpdate()
    .skipLocked()
    .limit(limit)
    .execute()
}

export async function updateRowQueuedAt(
  trx: TransactionDatabase,
  plan_id: number
): Promise<PlanRow> {
  return await trx
    .updateTable('plan')
    .set(() => ({
      queued_at: sql`NOW()`
    }))
    .where('id', '=', plan_id)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateRowBusiness(
  trx: TransactionDatabase,
  plan_id: number,
  is_enabled: boolean,
  subscriptions: number
): Promise<PlanRow> {
  return await trx
    .updateTable('plan')
    .set(() => ({
      is_enabled,
      subscriptions,
      updated_at: sql`NOW()`
    }))
    .where('id', '=', plan_id)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export const buildModel = (row: PlanRow): Plan => {
  return {
    id: row.id,
    categoriesMax: row.categories_max,
    priceRub: row.price_rub,
    durationDays: row.duration_days,
    intervalSec: row.interval_sec,
    analyticsOn: row.analytics_on,
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
