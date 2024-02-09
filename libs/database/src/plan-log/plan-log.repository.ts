import { Transaction, sql } from 'kysely'
import { PgPubSub, AnyJson } from '@imqueue/pg-pubsub'
// PlanLog
import { PlanLog } from './plan-log.js'
import { PlanLogRow, InsertablePlanLogRow } from './plan-log.table.js'
// Database
import { Database } from '../database.js'

export async function selectRowsByPlanId(
  trx: Transaction<Database>,
  plan_id: number,
  limit: number
): Promise<PlanLogRow[]> {
  return await trx
    .selectFrom('plan_log')
    .selectAll()
    .where('plan_id', '=', plan_id)
    .orderBy('created_at', 'desc')
    .limit(limit)
    .execute()
}

export async function insertRow(
  trx: Transaction<Database>,
  row: InsertablePlanLogRow
): Promise<PlanLogRow> {
  return await trx
    .insertInto('plan_log')
    .values(() => ({
      ...row,
      created_at: sql`NOW()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function notify(
  pubSub: PgPubSub,
  planLogRow: PlanLogRow
): Promise<void> {
  await pubSub.notify('plan', planLogRow as AnyJson)
}

export const buildModel = (row: PlanLogRow): PlanLog => {
  return {
    id: row.id,
    planId: row.plan_id,
    action: row.action,
    categoriesMax: row.categories_max,
    priceRub: row.price_rub,
    durationDays: row.duration_days,
    intervalSec: row.interval_sec,
    analyticsOn: row.analytics_on,
    isEnabled: row.is_enabled,
    subscriptions: row.subscriptions,
    data: row.data,
    createdAt: row.created_at
  }
}

export const buildCollection = (rows: PlanLogRow[]): PlanLog[] => {
  return rows.map((row) => buildModel(row))
}
