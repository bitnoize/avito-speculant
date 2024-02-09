import { Kysely } from 'kysely'
import { PgPubSub } from '@imqueue/pg-pubsub'
// Plan
import { CreatePlanRequest, CreatePlanResponse } from './plan.js'
import * as planRepository from './plan.repository.js'
// PlanLog
import * as planLogRepository from '../plan-log/plan-log.repository.js'
// Database
import { Database } from '../database.js'

export async function createPlan(
  db: Kysely<Database>,
  pubSub: PgPubSub,
  request: CreatePlanRequest
): Promise<CreatePlanResponse> {
  return await db.transaction().execute(async (trx) => {
    const planRow = await planRepository.insertRow(trx, {
      categories_max: request.categoriesMax,
      price_rub: request.priceRub,
      duration_days: request.durationDays,
      interval_sec: request.intervalSec,
      analytics_on: request.analyticsOn
    })

    const planLogRow = await planLogRepository.insertRow(trx, {
      plan_id: planRow.id,
      action: 'create_plan',
      categories_max: planRow.categories_max,
      price_rub: planRow.price_rub,
      duration_days: planRow.duration_days,
      interval_sec: planRow.interval_sec,
      analytics_on: planRow.analytics_on,
      is_enabled: planRow.is_enabled,
      subscriptions: planRow.subscriptions,
      data: request.data
    })

    //await planLogRepository.notify(pubSub, planLogRow)

    return {
      message: `Plan successfully created`,
      statusCode: 201,
      plan: planRepository.buildModel(planRow)
    }
  })
}
