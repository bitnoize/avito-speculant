import { SubscriptionNotFoundError } from '@avito-speculant/domain'
import {
  ListSubscriptionLogsRequest,
  ListSubscriptionLogsResponse
} from './dto/list-subscription-logs.js'
import * as subscriptionRepository from '../subscription/subscription.repository.js'
import * as subscriptionLogRepository from './subscription-log.repository.js'
import { KyselyDatabase } from '../database.js'

/*
 * List SubscriptionLogs
 */
export async function listSubscriptionLogs(
  db: KyselyDatabase,
  request: ListSubscriptionLogsRequest
): Promise<ListSubscriptionLogsResponse> {
  return await db.transaction().execute(async (trx) => {
    const subscriptionRow = await subscriptionRepository.selectRowByIdForShare(
      trx,
      request.subscriptionId
    )

    if (subscriptionRow === undefined) {
      throw new SubscriptionNotFoundError<ListSubscriptionLogsRequest>(request)
    }

    const subscriptionLogRows = await subscriptionLogRepository.selectRowsList(
      trx,
      subscriptionRow.id,
      request.limit
    )

    return {
      message: `SubscriptionLogs successfully listed`,
      statusCode: 200,
      subscriptionLogs:
        subscriptionLogRepository.buildCollection(subscriptionLogRows),
      limit: request.limit
    }
  })
}
