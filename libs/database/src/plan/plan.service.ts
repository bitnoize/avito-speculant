import { Notify, Plan } from '@avito-speculant/domain'
import { CreatePlanRequest, CreatePlanResponse } from './dto/create-plan.js'
import { ListPlansRequest, ListPlansResponse } from './dto/list-plans.js'
import { SchedulePlansRequest, SchedulePlansResponse } from './dto/schedule-plans.js'
import * as userRepository from '../user/user.repository.js'
import * as planRepository from './plan.repository.js'
import * as planLogRepository from '../plan-log/plan-log.repository.js'
import * as subscriptionRepository from '../subscription/subscription.repository.js'
import { KyselyDatabase, TransactionDatabase } from '../database.js'

/**
 * Create Plan
 */
export async function createPlan(
  db: KyselyDatabase,
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

    backLog.push(['plan', planLogRepository.buildNotify(planLogRow)])

    return {
      message: `Plan successfully created`,
      statusCode: 201,
      plan: planRepository.buildModel(planRow),
      backLog
    }
  })
}

/**
 * List Plans
 */
export async function listPlans(
  db: KyselyDatabase,
  request: ListPlansRequest
): Promise<ListPlansResponse> {
  return await db.transaction().execute(async (trx) => {
    const planRows = await planRepository.selectRowsForShare(trx)

    return {
      message: `Plan successfully created`,
      statusCode: 201,
      plans: planRepository.buildCollection(planRows),
    }
  })
}

/**
 * Schedule Plans
 */
export async function schedulePlans(
  trx: TransactionDatabase,
  request: SchedulePlansRequest
): Promise<SchedulePlansResponse> {
  const selectedPlanRows = await planRepository.selectRowsSkipLockedForUpdate(
    trx,
    request.limit
  )

  if (selectedPlanRows.length === 0) {
    return {
      message: `No plans pending to schedule`,
      statusCode: 200,
      plans: [],
      backLog: []
    }
  }

  const plans: Plan[] = []
  const backLog: Notify[] = []

  for (const planRow of selectedPlanRows) {
    let isModified = false

    const { subscriptions } = await subscriptionRepository.selectCountByPlanId(
      trx,
      planRow.id
    )

    if (planRow.subscriptions !== subscriptions) {
      isModified = true

      planRow.subscriptions = subscriptions
    }

    const updatedPlanRow = await planRepository.updateRowScheduledAt(
      trx,
      planRow.id,
      planRow.subscriptions
    )

    plans.push(planRepository.buildModel(planRow))

    if (isModified) {
      const planLogRow = await planLogRepository.insertRow(
        trx,
        'schedule_plan',
        updatedPlanRow,
        request.data
      )
    
      backLog.push(['plan', planLogRepository.buildNotify(planLogRow)])
    }
  }

  return {
    message: `Plans ready to schedule`,
    statusCode: 201,
    plans,
    backLog
  }
}
