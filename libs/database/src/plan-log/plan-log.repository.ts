import { sql } from 'kysely'
import { Notify } from '@avito-speculant/common'
import { PlanLog, PlanLogData } from './plan-log.js'
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
    .forShare()
    .execute()
}

export async function insertRow(
  trx: TransactionDatabase,
  plan_id: number,
  action: string,
  price_rub: number,
  is_enabled: boolean,
  subscriptions: number,
  data: PlanLogData
): Promise<PlanLogRow> {
  return await trx
    .insertInto('plan_log')
    .values(() => ({
      plan_id,
      action,
      price_rub,
      is_enabled,
      subscriptions,
      data,
      created_at: sql<number>`now()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export const buildModel = (row: PlanLogRow): PlanLog => {
  return {
    id: row.id,
    planId: row.plan_id,
    action: row.action,
    priceRub: row.price_rub,
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
