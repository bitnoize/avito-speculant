import { Transaction, sql } from 'kysely'
// Plan
import { PlanRow, InsertablePlanRow, UpdateablePlanRow } from './plan.table.js'
import { Plan } from './plan.js'
// Database
import { Database } from '../database.js'

export async function selectRowByIdForShare(
  trx: Transaction<Database>,
  plan_id: number
): Promise<PlanRow | undefined> {
  return await trx
    .selectFrom('plan')
    .selectAll()
    .where('id', '=', plan_id)
    .forShare()
    .executeTakeFirst()
}

export async function insertRow(
  trx: Transaction<Database>,
  row: InsertablePlanRow
): Promise<PlanRow> {
  return await trx
    .insertInto('plan')
    .values(() => ({
      ...row,
      created_at: sql`NOW()`,
      updated_at: sql`NOW()`,
      scheduled_at: sql`NOW()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export const buildModel = (row: PlanRow): Plan => {
  return {
    id: row.id,
    sortOrder: row.sort_order,
    categoriesMax: row.categories_max,
    priceRub: row.price_rub,
    durationDays: row.duration_days,
    intervalSec: row.interval_dec,
    analyticsOn: row.analytics_on,
    isEnabled: row.is_enabled,
    subscriptions: row.subscriptions,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    scheduledAt: row.scheduled_at
  }
}

export const buildCollection = (rows: PlanRow[]): Plan[] => {
  return rows.map((row) => buildModel(row))
}
