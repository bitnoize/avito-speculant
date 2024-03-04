import { sql } from 'kysely'
import { PlanLog, PlanLogData } from './plan-log.js'
import { PlanLogRow } from './plan-log.table.js'
import { TransactionDatabase, Notify } from '../database.js'

export async function insertRow(
  trx: TransactionDatabase,
  plan_id: number,
  action: string,
  categories_max: number,
  price_rub: number,
  duration_days: number,
  interval_sec: number,
  analytics_on: boolean,
  is_enabled: boolean,
  subscriptions: number,
  data: PlanLogData
): Promise<PlanLogRow> {
  return await trx
    .insertInto('plan_log')
    .values(() => ({
      plan_id,
      action,
      categories_max,
      price_rub,
      duration_days,
      interval_sec,
      analytics_on,
      is_enabled,
      subscriptions,
      data,
      created_at: sql`NOW()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function selectRowsList(
  trx: TransactionDatabase,
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

export const buildNotify = (row: PlanLogRow): Notify => {
  return ['plan', row.id, row.plan_id, row.action]
}
