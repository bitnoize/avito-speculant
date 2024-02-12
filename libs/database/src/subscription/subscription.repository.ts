import { Transaction, sql } from 'kysely'
import { Subscription } from '@avito-speculant/domain'
import { UserRow } from '../user/user.table.js'
import { PlanRow } from '../plan/plan.table.js'
import {
  SubscriptionRow,
  InsertableSubscriptionRow,
  UpdateableSubscriptionRow
} from './subscription.table.js'
import { Database } from '../database.js'

export async function selectRowByIdForShare(
  trx: Transaction<Database>,
  subscription_id: number
): Promise<SubscriptionRow | undefined> {
  return await trx
    .selectFrom('subscription')
    .selectAll()
    .where('id', '=', subscription_id)
    .forShare()
    .executeTakeFirst()
}

export async function selectRowByUserIdWaitStatusForShare(
  trx: Transaction<Database>,
  user_id: number
): Promise<SubscriptionRow | undefined> {
  return await trx
    .selectFrom('subscription')
    .selectAll()
    .where('user_id', '=', user_id)
    .where('status', '=', 'wait')
    .forShare()
    .executeTakeFirst()
}

export async function insertRow(
  trx: Transaction<Database>,
  userRow: UserRow,
  planRow: PlanRow,
): Promise<SubscriptionRow> {
  return await trx
    .insertInto('subscription')
    .values(() => ({
      ...normalizeSubscriptionRow(userRow, planRow),
      status: sql.lit('wait'),
      create_time: sql.val('NOW()'),
      update_time: sql.val('NOW()'),
      process_time: sql.val('NOW()')
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateRowCancelStatus(
  trx: Transaction<Database>,
  subscription_id: number
): Promise<SubscriptionRow> {
  return await trx
    .updateTable('subscription')
    .set((eb) => ({
      status: sql.lit('cancel'),
      updated_at: sql.val('NOW()')
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
    scheduledAt: row.scheduled_at
  }
}

export const buildCollection = (rows: SubscriptionRow[]): Subscription[] => {
  return rows.map((row) => buildModel(row))
}

const normalizeSubscriptionRow = (
  userRow: UserRow,
  planRow: PlanRow,
): InsertableSubscriptionRow => {
  return {
    user_id: userRow.id,
    plan_id: planRow.id,
    categories_max: planRow.categories_max,
    price_rub: planRow.price_rub,
    duration_days: planRow.duration_days,
    interval_sec: planRow.interval_sec,
    analytics_on: planRow.analytics_on
  }
}
