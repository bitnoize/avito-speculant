import { PlanNotFoundError } from '@avito-speculant/domain'
import { ListPlanLogsRequest, ListPlanLogsResponse } from './dto/list-plan-logs.js'
import * as planRepository from '../plan/plan.repository.js'
import * as planLogRepository from './plan-log.repository.js'
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
      request.limit
    )

    return {
      message: `PlanLogs successfully listed`,
      statusCode: 200,
      planLogs: planLogRepository.buildCollection(planLogRows),
      limit: request.limit
    }
  })
}
