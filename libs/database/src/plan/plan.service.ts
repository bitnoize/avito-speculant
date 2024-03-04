import { CreatePlanRequest, CreatePlanResponse } from './dto/create-plan.js'
import { UpdatePlanRequest, UpdatePlanResponse } from './dto/update-plan.js'
import { EnableDisablePlanRequest, EnableDisablePlanResponse } from './dto/enable-disable-plan.js'
import { ListPlansRequest, ListPlansResponse } from './dto/list-plans.js'
import { QueuePlansRequest, QueuePlansResponse } from './dto/queue-plans.js'
import { BusinessPlanRequest, BusinessPlanResponse } from './dto/business-plan.js'
import { Plan } from './plan.js'
import { PlanNotFoundError, PlanIsEnabledError } from './plan.errors.js'
import * as planRepository from './plan.repository.js'
import * as planLogRepository from '../plan-log/plan-log.repository.js'
import * as subscriptionRepository from '../subscription/subscription.repository.js'
import { KyselyDatabase, Notify } from '../database.js'

/**
 * Create Plan
 */
export async function createPlan(
  db: KyselyDatabase,
  request: CreatePlanRequest
): Promise<CreatePlanResponse> {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    // ...

    const insertedPlanRow = await planRepository.insertRow(
      trx,
      request.categoriesMax,
      request.priceRub,
      request.durationDays,
      request.intervalSec,
      request.analyticsOn
    )

    const planLogRow = await planLogRepository.insertRow(
      trx,
      insertedPlanRow.id,
      'create_plan',
      insertedPlanRow.categories_max,
      insertedPlanRow.price_rub,
      insertedPlanRow.duration_days,
      insertedPlanRow.interval_sec,
      insertedPlanRow.analytics_on,
      insertedPlanRow.is_enabled,
      insertedPlanRow.subscriptions,
      request.data
    )

    backLog.push(planLogRepository.buildNotify(planLogRow))

    return {
      message: `Plan successfully created`,
      statusCode: 201,
      plan: planRepository.buildModel(insertedPlanRow),
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

    const selectedPlanRow = await planRepository.selectRowByIdForUpdate(trx, request.planId)

    if (selectedPlanRow === undefined) {
      throw new PlanNotFoundError<UpdatePlanRequest>(request)
    }

    if (selectedPlanRow.is_enabled) {
      throw new PlanIsEnabledError<UpdatePlanRequest>(request)
    }

    // ...

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
      updatedPlanRow.id,
      'update_plan',
      updatedPlanRow.categories_max,
      updatedPlanRow.price_rub,
      updatedPlanRow.duration_days,
      updatedPlanRow.interval_sec,
      updatedPlanRow.analytics_on,
      updatedPlanRow.is_enabled,
      updatedPlanRow.subscriptions,
      request.data
    )

    backLog.push(planLogRepository.buildNotify(planLogRow))

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

    const selectedPlanRow = await planRepository.selectRowByIdForUpdate(trx, request.planId)

    if (selectedPlanRow === undefined) {
      throw new PlanNotFoundError<EnableDisablePlanRequest>(request)
    }

    if (selectedPlanRow.is_enabled) {
      return {
        message: `Plan allready enabled`,
        statusCode: 200,
        plan: planRepository.buildModel(selectedPlanRow),
        backLog
      }
    }

    // ...

    const updatedPlanRow = await planRepository.updateRowIsEnabled(trx, selectedPlanRow.id, true)

    const planLogRow = await planLogRepository.insertRow(
      trx,
      updatedPlanRow.id,
      'enable_plan',
      updatedPlanRow.categories_max,
      updatedPlanRow.price_rub,
      updatedPlanRow.duration_days,
      updatedPlanRow.interval_sec,
      updatedPlanRow.analytics_on,
      updatedPlanRow.is_enabled,
      updatedPlanRow.subscriptions,
      request.data
    )

    backLog.push(planLogRepository.buildNotify(planLogRow))

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

    const selectedPlanRow = await planRepository.selectRowByIdForUpdate(trx, request.planId)

    if (selectedPlanRow === undefined) {
      throw new PlanNotFoundError<EnableDisablePlanRequest>(request)
    }

    if (!selectedPlanRow.is_enabled) {
      return {
        message: `Plan allready disabled`,
        statusCode: 200,
        plan: planRepository.buildModel(selectedPlanRow),
        backLog
      }
    }

    // ...

    const updatedPlanRow = await planRepository.updateRowIsEnabled(trx, selectedPlanRow.id, false)

    const planLogRow = await planLogRepository.insertRow(
      trx,
      updatedPlanRow.id,
      'disable_plan',
      updatedPlanRow.categories_max,
      updatedPlanRow.price_rub,
      updatedPlanRow.duration_days,
      updatedPlanRow.interval_sec,
      updatedPlanRow.analytics_on,
      updatedPlanRow.is_enabled,
      updatedPlanRow.subscriptions,
      request.data
    )

    backLog.push(planLogRepository.buildNotify(planLogRow))

    return {
      message: `Plan successfully disabled`,
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
 * Queue Plans
 */
export async function queuePlans(
  db: KyselyDatabase,
  request: QueuePlansRequest
): Promise<QueuePlansResponse> {
  return await db.transaction().execute(async (trx) => {
    const plans: Plan[] = []

    const selectedPlanRows = await planRepository.selectRowsSkipLockedForUpdate(trx, request.limit)

    for (const planRow of selectedPlanRows) {
      const updatedPlanRow = await planRepository.updateRowQueuedAt(trx, planRow.id)

      plans.push(planRepository.buildModel(updatedPlanRow))
    }

    return {
      message: `Plans successfully queued`,
      statusCode: 200,
      plans
    }
  })
}

/**
 * Business Plan
 */
export async function businessPlan(
  db: KyselyDatabase,
  request: BusinessPlanRequest
): Promise<BusinessPlanResponse> {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []
    let isChanged = false

    const selectedPlanRow = await planRepository.selectRowByIdForUpdate(trx, request.planId)

    if (selectedPlanRow === undefined) {
      throw new PlanNotFoundError<BusinessPlanRequest>(request)
    }

    if (selectedPlanRow.is_enabled) {
      // TODO
    }

    const { subscriptions } = await subscriptionRepository.selectCountByPlanId(
      trx,
      selectedPlanRow.id
    )

    if (selectedPlanRow.subscriptions !== subscriptions) {
      isChanged = true

      selectedPlanRow.subscriptions = subscriptions
    }

    if (isChanged) {
      const updatedPlanRow = await planRepository.updateRowBusiness(
        trx,
        selectedPlanRow.id,
        selectedPlanRow.is_enabled,
        selectedPlanRow.subscriptions
      )

      const planLogRow = await planLogRepository.insertRow(
        trx,
        updatedPlanRow.id,
        'business_plan',
        updatedPlanRow.categories_max,
        updatedPlanRow.price_rub,
        updatedPlanRow.duration_days,
        updatedPlanRow.interval_sec,
        updatedPlanRow.analytics_on,
        updatedPlanRow.is_enabled,
        updatedPlanRow.subscriptions,
        request.data
      )

      backLog.push(planLogRepository.buildNotify(planLogRow))

      return {
        message: `Plan successfully processed`,
        statusCode: 201,
        plan: planRepository.buildModel(updatedPlanRow),
        backLog
      }
    }

    return {
      message: `Plan successfully processed`,
      statusCode: 200,
      plan: planRepository.buildModel(selectedPlanRow),
      backLog
    }
  })
}
