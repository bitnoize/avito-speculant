import { Kysely } from 'kysely'
import { Notify } from '@avito-speculant/domain'
import { CreatePlanRequest, CreatePlanResponse } from './dto/create-plan.js'
import * as planRepository from './plan.repository.js'
import * as planLogRepository from '../plan-log/plan-log.repository.js'
import { Database } from '../database.js'

/**
 * Create Plan
 */
export async function createPlan(
  db: Kysely<Database>,
  request: CreatePlanRequest
): Promise<CreatePlanResponse> {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const planRow = await planRepository.insertRow(
      trx,
      request.categoriesMax,
      request.priceRub,
      request.durationDays,
      request.intervalSec,
      request.analyticsOn
    )

    const planLogRow = await planLogRepository.insertRow(
      trx,
      'create_plan',
      planRow,
      request.data
    )

    backLog.push([
      'plan',
      planLogRepository.buildNotify(planLogRow)
    ])

    return {
      message: `Plan successfully created`,
      statusCode: 201,
      plan: planRepository.buildModel(planRow),
      backLog
    }
  })
}
