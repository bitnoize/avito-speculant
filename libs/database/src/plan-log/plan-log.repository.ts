import { Transaction, sql } from 'kysely'
import { PgPubSub } from '@imqueue/pg-pubsub'
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
    .orderBy('time', 'desc')
    .limit(limit)
    .execute()
}

export async function insertRow(
  trx: Transaction<Database>,
  row: InsertablePlanLogRow
): Promise<void> {
  await trx
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
  await pubSub.notify('plan', planLogRow)
}

export const buildModel = (row: PlanLogRow): PlanLog => {
  return {
    id: row.id,
    planId: row.plan_id,
    action: row.action,
    status: row.status,
    subscriptions: row.subscriptions,
    data: row.data,
    createdAt: row.created_at
  }
}

export const buildCollection = (rows: PlanLogRow[]): PlanLog[] => {
  return rows.map((row) => buildModel(row))
}
