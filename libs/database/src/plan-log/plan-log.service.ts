import { ListPlanLogs } from './dto/index.js'
import { PlanNotFoundError } from '../plan/plan.errors.js'
import * as planLogRepository from './plan-log.repository.js'
import * as planRepository from '../plan/plan.repository.js'

/*
 * List PlanLogs
 */
export const listPlanLogs: ListPlanLogs = async function listPlanLogs(db, request) {
  return await db.transaction().execute(async (trx) => {
    const planRow = await planRepository.selectRowById(trx, request.planId)

    if (planRow === undefined) {
      throw new PlanNotFoundError({ request })
    }

    const planLogRows = await planLogRepository.selectRowsByPlanId(
      trx,
      planRow.id,
      request.limit
    )

    return {
      planLogs: planLogRepository.buildCollection(planLogRows)
    }
  })
}
