import { sql } from 'kysely'
import { Subscription } from '@avito-speculant/domain'
import { UserRow } from '../user/user.table.js'
import { PlanRow } from '../plan/plan.table.js'
import { SubscriptionRow } from './subscription.table.js'
import { TransactionDatabase } from '../database.js'

export async function selectRowByIdForShare(
  trx: TransactionDatabase,
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
  trx: TransactionDatabase,
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
  trx: TransactionDatabase,
  userRow: UserRow,
  planRow: PlanRow
): Promise<SubscriptionRow> {
  return await trx
    .insertInto('subscription')
    .values(() => ({
      user_id: userRow.id,
      plan_id: planRow.id,
      categories_max: planRow.categories_max,
      price_rub: planRow.price_rub,
      duration_days: planRow.duration_days,
      interval_sec: planRow.interval_sec,
      analytics_on: planRow.analytics_on,
      status: 'wait',
      created_at: sql`NOW()`,
      updated_at: sql`NOW()`,
      scheduled_at: sql`NOW()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateRowCancelStatus(
  trx: TransactionDatabase,
  subscription_id: number
): Promise<SubscriptionRow> {
  return await trx
    .updateTable('subscription')
    .set((eb) => ({
      status: 'cancel',
      updated_at: sql`NOW()`
    }))
    .where('id', '=', subscription_id)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function selectCountByUserId(
  trx: TransactionDatabase,
  user_id: number
): Promise<{ subscriptions: number }> {
  return await trx
    .selectFrom('subscription')
    .select((eb) => eb.fn.countAll<number>().as('subscriptions'))
    .where('user_id', '=', user_id)
    .where('status', 'not in', ['wait', 'cancel'])
    .executeTakeFirstOrThrow()
}

export async function selectCountByPlanId(
  trx: TransactionDatabase,
  plan_id: number
): Promise<{ subscriptions: number }> {
  return await trx
    .selectFrom('subscription')
    .select((eb) => eb.fn.countAll<number>().as('subscriptions'))
    .where('plan_id', '=', plan_id)
    .where('status', 'not in', ['wait', 'cancel'])
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
