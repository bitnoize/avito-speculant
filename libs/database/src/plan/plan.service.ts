import { Notify } from '@avito-speculant/common'
import {
  CreatePlan,
  UpdatePlan,
  EnablePlan,
  DisablePlan,
  ListPlans,
  ProducePlans,
  ConsumePlan
} from './dto/index.js'
import { Plan } from './plan.js'
import { PlanNotFoundError, PlanIsEnabledError } from './plan.errors.js'
import * as planRepository from './plan.repository.js'
import * as planLogRepository from '../plan-log/plan-log.repository.js'
import * as subscriptionRepository from '../subscription/subscription.repository.js'

/**
 * Create Plan
 */
export const createPlan: CreatePlan = async function (db, request) {
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
      plan: planRepository.buildModel(insertedPlanRow),
      backLog
    }
  })
}

/**
 * Update Plan
 */
export const updatePlan: UpdatePlan = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const planRow = await planRepository.selectRowByIdForUpdate(trx, request.planId)

    if (planRow === undefined) {
      throw new PlanNotFoundError({ request })
    }

    if (planRow.is_enabled) {
      throw new PlanIsEnabledError({ request })
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
      plan: planRepository.buildModel(updatedPlanRow),
      backLog
    }
  })
}

/**
 * Enable Plan
 */
export const enablePlan: EnablePlan = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const planRow = await planRepository.selectRowByIdForUpdate(trx, request.planId)

    if (planRow === undefined) {
      throw new PlanNotFoundError({ request })
    }

    if (planRow.is_enabled) {
      return {
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
      plan: planRepository.buildModel(updatedPlanRow),
      backLog
    }
  })
}

/**
 * Disable Plan
 */
export const disablePlan: DisablePlan = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const planRow = await planRepository.selectRowByIdForUpdate(trx, request.planId)

    if (planRow === undefined) {
      throw new PlanNotFoundError({ request })
    }

    if (!planRow.is_enabled) {
      return {
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
      plan: planRepository.buildModel(updatedPlanRow),
      backLog
    }
  })
}

/**
 * List Plans
 */
export const listPlans: ListPlans = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const planRows = await planRepository.selectRowsList(trx, request.all ?? false)

    return {
      plans: planRepository.buildCollection(planRows)
    }
  })
}

/**
 * Produce Plans
 */
export const producePlans: ProducePlans = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const plans: Plan[] = []

    const planRows = await planRepository.selectRowsProduce(trx, request.limit)

    for (const planRow of planRows) {
      const updatedPlanRow = await planRepository.updateRowProduce(trx, planRow.id)

      plans.push(planRepository.buildModel(updatedPlanRow))
    }

    return { plans }
  })
}

/**
 * Consume Plan
 */
export const consumePlan: ConsumePlan = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []
    let isChanged = false

    const planRow = await planRepository.selectRowByIdForUpdate(trx, request.planId)

    if (planRow === undefined) {
      throw new PlanNotFoundError({ request })
    }

    if (planRow.is_enabled) {
      // ...
    }

    // ...

    const { subscriptions } = await subscriptionRepository.selectCountByPlanId(trx, planRow.id)

    if (planRow.subscriptions !== subscriptions) {
      isChanged = true

      planRow.subscriptions = subscriptions
    }

    if (!isChanged) {
      return {
        plan: planRepository.buildModel(planRow),
        backLog
      }
    }

    const updatedPlanRow = await planRepository.updateRowConsume(
      trx,
      planRow.id,
      planRow.is_enabled,
      planRow.subscriptions
    )

    const planLogRow = await planLogRepository.insertRow(
      trx,
      updatedPlanRow.id,
      'consume_plan',
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
      plan: planRepository.buildModel(updatedPlanRow),
      backLog
    }
  })
}
