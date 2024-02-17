import {
  Notify,
  Plan,
  PlanNotFoundError,
  PlanIsEnabledError
} from '@avito-speculant/domain'
import { CreatePlanRequest, CreatePlanResponse } from './dto/create-plan.js'
import { UpdatePlanRequest, UpdatePlanResponse } from './dto/update-plan.js'
import {
  EnableDisablePlanRequest,
  EnableDisablePlanResponse
} from './dto/enable-disable-plan.js'
import { ListPlansRequest, ListPlansResponse } from './dto/list-plans.js'
import {
  SchedulePlansRequest,
  SchedulePlansResponse
} from './dto/schedule-plans.js'
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
 * Update Plan
 */
export async function updatePlan(
  db: KyselyDatabase,
  request: UpdatePlanRequest
): Promise<UpdatePlanResponse> {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const selectedPlanRow = await planRepository.selectRowByIdForUpdate(
      trx,
      request.id
    )

    if (selectedPlanRow === undefined) {
      throw new PlanNotFoundError<UpdatePlanRequest>(request, 400)
    }

    if (selectedPlanRow.is_enabled) {
      throw new PlanIsEnabledError<UpdatePlanRequest>(request, 403)
    }

    if (
      !(
        request.categoriesMax != null ||
        request.priceRub != null ||
        request.durationDays != null ||
        request.intervalSec != null ||
        request.analyticsOn != null
      )
    ) {
      return {
        message: `Plan no updates specified`,
        statusCode: 200,
        plan: planRepository.buildModel(selectedPlanRow),
        backLog
      }
    }

    const updatedPlanRow = await planRepository.updateRow(
      trx,
      selectedPlanRow.id,
      request.categoriesMax,
      request.priceRub,
      request.durationDays,
      request.intervalSec,
      request.analyticsOn
    )

    const planLogRow = await planLogRepository.insertRow(
      trx,
      'update_plan',
      updatedPlanRow,
      request.data
    )

    backLog.push(['plan', planLogRepository.buildNotify(planLogRow)])

    return {
      message: `Plan successfully updated`,
      statusCode: 201,
      plan: planRepository.buildModel(updatedPlanRow),
      backLog
    }
  })
}

/**
 * Enable Plan
 */
export async function enablePlan(
  db: KyselyDatabase,
  request: EnableDisablePlanRequest
): Promise<EnableDisablePlanResponse> {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const selectedPlanRow = await planRepository.selectRowByIdForUpdate(
      trx,
      request.id
    )

    if (selectedPlanRow === undefined) {
      throw new PlanNotFoundError<EnableDisablePlanRequest>(request, 400)
    }

    if (selectedPlanRow.is_enabled) {
      return {
        message: `Plan allready enabled`,
        statusCode: 200,
        plan: planRepository.buildModel(selectedPlanRow),
        backLog
      }
    }

    const updatedPlanRow = await planRepository.updateRowIsEnabled(
      trx,
      selectedPlanRow.id,
      true
    )

    const planLogRow = await planLogRepository.insertRow(
      trx,
      'enable_plan',
      updatedPlanRow,
      request.data
    )

    backLog.push(['plan', planLogRepository.buildNotify(planLogRow)])

    return {
      message: `Plan successfully enabled`,
      statusCode: 201,
      plan: planRepository.buildModel(updatedPlanRow),
      backLog
    }
  })
}

/**
 * Disable Plan
 */
export async function disablePlan(
  db: KyselyDatabase,
  request: EnableDisablePlanRequest
): Promise<EnableDisablePlanResponse> {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const selectedPlanRow = await planRepository.selectRowByIdForUpdate(
      trx,
      request.id
    )

    if (selectedPlanRow === undefined) {
      throw new PlanNotFoundError<EnableDisablePlanRequest>(request, 400)
    }

    if (!selectedPlanRow.is_enabled) {
      return {
        message: `Plan allready disabled`,
        statusCode: 200,
        plan: planRepository.buildModel(selectedPlanRow),
        backLog
      }
    }

    const updatedPlanRow = await planRepository.updateRowIsEnabled(
      trx,
      selectedPlanRow.id,
      false
    )

    const planLogRow = await planLogRepository.insertRow(
      trx,
      'disable_plan',
      updatedPlanRow,
      request.data
    )

    backLog.push(['plan', planLogRepository.buildNotify(planLogRow)])

    return {
      message: `Plan successfully enabled`,
      statusCode: 201,
      plan: planRepository.buildModel(updatedPlanRow),
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
    const planRows = await planRepository.selectRowsList(trx, request.all)

    return {
      message: `Plans successfully listed`,
      statusCode: 200,
      plans: planRepository.buildCollection(planRows),
      all: request.all
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

    const updatedPlanRow = await planRepository.updateRowSchedule(
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
