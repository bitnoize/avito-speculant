import { Notify } from '@avito-speculant/common'
import {
  CreatePlan,
  ReadPlan,
  UpdatePlanPrice,
  EnablePlan,
  DisablePlan,
  ListPlans,
  ProducePlans,
  ConsumePlan
} from './dto/index.js'
import { PlanNotFoundError, PlanExistsError, PlanIsEnabledError } from './plan.errors.js'
import * as planRepository from './plan.repository.js'
import * as planLogRepository from '../plan-log/plan-log.repository.js'
import * as subscriptionRepository from '../subscription/subscription.repository.js'

/**
 * Create Plan
 */
export const createPlan: CreatePlan = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const existsPlanRow = await planRepository.selectRowByUnique(
      trx,
      request.categoriesMax,
      request.durationDays,
      request.intervalSec,
      request.analyticsOn
    )

    if (existsPlanRow !== undefined) {
      throw new PlanExistsError({ request, existsPlanRow })
    }

    const insertedPlanRow = await planRepository.insertRow(
      trx,
      request.categoriesMax,
      request.durationDays,
      request.intervalSec,
      request.analyticsOn,
      request.priceRub
    )

    const planLogRow = await planLogRepository.insertRow(
      trx,
      insertedPlanRow.id,
      'create_plan',
      insertedPlanRow.price_rub,
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
 * Read Plan
 */
export const readPlan: ReadPlan = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const planRow = await planRepository.selectRowById(trx, request.planId)

    if (planRow === undefined) {
      throw new PlanNotFoundError({ request })
    }

    return {
      plan: planRepository.buildModel(planRow)
    }
  })
}

/**
 * Update Plan Price
 */
export const updatePlanPrice: UpdatePlanPrice = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const planRow = await planRepository.selectRowById(trx, request.planId, true)

    if (planRow === undefined) {
      throw new PlanNotFoundError({ request })
    }

    if (planRow.is_enabled) {
      throw new PlanIsEnabledError({ request, planRow })
    }

    planRow.price_rub = request.priceRub

    const updatedPlanRow = await planRepository.updateRowPriceRub(
      trx,
      planRow.id,
      planRow.price_rub
    )

    const planLogRow = await planLogRepository.insertRow(
      trx,
      updatedPlanRow.id,
      'update_plan_price',
      updatedPlanRow.price_rub,
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

    const planRow = await planRepository.selectRowById(trx, request.planId, true)

    if (planRow === undefined) {
      throw new PlanNotFoundError({ request })
    }

    if (planRow.is_enabled) {
      return {
        plan: planRepository.buildModel(planRow),
        backLog
      }
    }

    planRow.is_enabled = true

    const updatedPlanRow = await planRepository.updateRowState(trx, planRow.id, planRow.is_enabled)

    const planLogRow = await planLogRepository.insertRow(
      trx,
      updatedPlanRow.id,
      'enable_plan',
      updatedPlanRow.price_rub,
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

    const planRow = await planRepository.selectRowById(trx, request.planId, true)

    if (planRow === undefined) {
      throw new PlanNotFoundError({ request })
    }

    if (!planRow.is_enabled) {
      return {
        plan: planRepository.buildModel(planRow),
        backLog
      }
    }

    planRow.is_enabled = false

    const updatedPlanRow = await planRepository.updateRowState(trx, planRow.id, planRow.is_enabled)

    const planLogRow = await planLogRepository.insertRow(
      trx,
      updatedPlanRow.id,
      'disable_plan',
      updatedPlanRow.price_rub,
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
export const listPlans: ListPlans = async function (db) {
  return await db.transaction().execute(async (trx) => {
    const planRows = await planRepository.selectRows(trx)

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
    const planRows = await planRepository.selectRowsProduce(trx, request.limit)

    const updatedPlanRows = await planRepository.updateRowsProduce(
      trx,
      planRows.map((planRow) => planRow.id)
    )

    return {
      plans: planRepository.buildCollection(updatedPlanRows)
    }
  })
}

/**
 * Consume Plan
 */
export const consumePlan: ConsumePlan = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const planRow = await planRepository.selectRowById(trx, request.planId, true)

    if (planRow === undefined) {
      throw new PlanNotFoundError({ request })
    }

    planRow.subscriptions = await subscriptionRepository.selectCountByPlanId(trx, planRow.id)

    await planRepository.updateRowCounters(trx, planRow.id, planRow.subscriptions)

    return {
      plan: planRepository.buildModel(planRow)
    }
  })
}
