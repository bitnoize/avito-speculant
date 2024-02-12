import { Kysely } from 'kysely'
import { PlanNotFoundError } from '@avito-speculant/domain'
import { ListPlanLogsRequest, ListPlanLogsResponse } from './dto/list-plan-logs.js'
import * as planRepository from '../plan/plan.repository.js'
import * as planLogRepository from './plan-log.repository.js'
import { Database } from '../database.js'

export async function listPlanLogs(
  db: Kysely<Database>,
  request: ListPlanLogsRequest
): Promise<ListPlanLogsResponse> {
  return await db.transaction().execute(async (trx) => {
    const planRow = await planRepository.selectRowByIdForShare(trx, request.planId)

    if (planRow === undefined) {
      throw new PlanNotFoundError(request, 400)
    }

    const planLogRows = await planLogRepository.selectRowsByPlanId(
      trx,
      planRow.id,
      request.limit
    )

    return {
      message: `PlanLogs listed successfully`,
      statusCode: 200,
      planLogs: planLogRepository.buildCollection(planLogRows),
      limit: request.limit
    }
  })
}
