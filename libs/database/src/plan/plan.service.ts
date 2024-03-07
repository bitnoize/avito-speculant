import { Notify } from '@avito-speculant/notify'
import {
  CreatePlanRequest,
  CreatePlanResponse,
  UpdatePlanRequest,
  UpdatePlanResponse,
  EnableDisablePlanRequest,
  EnableDisablePlanResponse,
  ListPlansRequest,
  ListPlansResponse,
  QueuePlansRequest,
  QueuePlansResponse,
  BusinessPlanRequest,
  BusinessPlanResponse
} from './dto/index.js'
import { DEFAULT_PLAN_LIST_ALL, DEFAULT_PLAN_QUEUE_LIMIT, Plan } from './plan.js'
import { PlanNotFoundError, PlanIsEnabledError } from './plan.errors.js'
import * as planRepository from './plan.repository.js'
import * as planLogRepository from '../plan-log/plan-log.repository.js'
import * as subscriptionRepository from '../subscription/subscription.repository.js'
import { KyselyDatabase } from '../database.js'

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

    const planRow = await planRepository.selectRowByIdForUpdate(trx, request.planId)

    if (planRow === undefined) {
      throw new PlanNotFoundError<UpdatePlanRequest>(request)
    }

    if (planRow.is_enabled) {
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
        plan: planRepository.buildModel(planRow),
        backLog
      }
    }

    const updatedPlanRow = await planRepository.updateRow(
      trx,
      planRow.id,
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

    const planRow = await planRepository.selectRowByIdForUpdate(trx, request.planId)

    if (planRow === undefined) {
      throw new PlanNotFoundError<EnableDisablePlanRequest>(request)
    }

    if (planRow.is_enabled) {
      return {
        message: `Plan allready enabled`,
        statusCode: 200,
        plan: planRepository.buildModel(planRow),
        backLog
      }
    }

    // ...

    const updatedPlanRow = await planRepository.updateRowIsEnabled(trx, planRow.id, true)

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

    const planRow = await planRepository.selectRowByIdForUpdate(trx, request.planId)

    if (planRow === undefined) {
      throw new PlanNotFoundError<EnableDisablePlanRequest>(request)
    }

    if (!planRow.is_enabled) {
      return {
        message: `Plan allready disabled`,
        statusCode: 200,
        plan: planRepository.buildModel(planRow),
        backLog
      }
    }

    // ...

    const updatedPlanRow = await planRepository.updateRowIsEnabled(trx, planRow.id, false)

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
    const planRows = await planRepository.selectRowsList(
      trx,
      (request.all ??= DEFAULT_PLAN_LIST_ALL)
    )

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

    const planRows = await planRepository.selectRowsSkipLockedForUpdate(
      trx,
      (request.limit ??= DEFAULT_PLAN_QUEUE_LIMIT)
    )

    for (const planRow of planRows) {
      const updatedPlanRow = await planRepository.updateRowQueuedAt(trx, planRow.id)

      plans.push(planRepository.buildModel(updatedPlanRow))
    }

    return {
      message: `Plans successfully enqueued`,
      statusCode: 200,
      plans,
      limit: request.limit
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

    const planRow = await planRepository.selectRowByIdForUpdate(trx, request.planId)

    if (planRow === undefined) {
      throw new PlanNotFoundError<BusinessPlanRequest>(request)
    }

    if (planRow.is_enabled) {
      // TODO
    }

    const { subscriptions } = await subscriptionRepository.selectCountByPlanId(trx, planRow.id)

    if (planRow.subscriptions !== subscriptions) {
      isChanged = true

      planRow.subscriptions = subscriptions
    }

    // ...

    if (!isChanged) {
      return {
        message: `Plan not changed`,
        statusCode: 200,
        plan: planRepository.buildModel(planRow),
        backLog
      }
    }

    const updatedPlanRow = await planRepository.updateRowBusiness(
      trx,
      planRow.id,
      planRow.is_enabled,
      planRow.subscriptions
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
  })
}
