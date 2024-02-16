import { sql } from 'kysely'
import { PlanLog, PlanLogData } from '@avito-speculant/domain'
import { PlanRow } from '../plan/plan.table.js'
import { PlanLogRow } from './plan-log.table.js'
import { TransactionDatabase } from '../database.js'

export async function selectRowsByPlanId(
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

export async function insertRow(
  trx: TransactionDatabase,
  action: string,
  planRow: PlanRow,
  data: PlanLogData
): Promise<PlanLogRow> {
  return await trx
    .insertInto('plan_log')
    .values(() => ({
      plan_id: planRow.id,
      action,
      categories_max: planRow.categories_max,
      price_rub: planRow.price_rub,
      duration_days: planRow.duration_days,
      interval_sec: planRow.interval_sec,
      analytics_on: planRow.analytics_on,
      is_enabled: planRow.is_enabled,
      subscriptions: planRow.subscriptions,
      data,
      created_at: sql`NOW()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
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

export const buildNotify = (row: PlanLogRow): string => {
  return JSON.stringify(buildModel(row))
}
