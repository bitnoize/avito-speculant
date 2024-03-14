import { ListPlanLogsRequest, ListPlanLogsResponse } from './dto/index.js'
import { PlanNotFoundError } from '../plan/plan.errors.js'
import * as planLogRepository from './plan-log.repository.js'
import * as planRepository from '../plan/plan.repository.js'
import { DEFAULT_LIST_LIMIT, KyselyDatabase } from '../database.js'

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
      request.limit ?? DEFAULT_LIST_LIMIT
    )

    return {
      planLogs: planLogRepository.buildCollection(planLogRows)
    }
  })
}
