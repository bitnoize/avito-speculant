import { ListPlanLogsRequest, ListPlanLogsResponse } from './dto/index.js'
import { DEFAULT_PLAN_LOG_LIST_LIMIT } from './plan-log.js'
import { PlanNotFoundError } from '../plan/plan.errors.js'
import * as planLogRepository from './plan-log.repository.js'
import * as planRepository from '../plan/plan.repository.js'
import { KyselyDatabase } from '../database.js'

/*
 * List PlanLogs
 */
export async function listPlanLogs(
  db: KyselyDatabase,
  request: ListPlanLogsRequest
): Promise<ListPlanLogsResponse> {
  return await db.transaction().execute(async (trx) => {
    const planRow = await planRepository.selectRowByIdForShare(trx, request.planId)

    if (planRow === undefined) {
      throw new PlanNotFoundError<ListPlanLogsRequest>(request)
    }

    const planLogRows = await planLogRepository.selectRowsList(
      trx,
      planRow.id,
      (request.limit ??= DEFAULT_PLAN_LOG_LIST_LIMIT)
    )

    return {
      message: `PlanLogs successfully listed`,
      statusCode: 200,
      planLogs: planLogRepository.buildCollection(planLogRows),
      limit: request.limit
    }
  })
}
