import { ListSubscriptionLogsRequest, ListSubscriptionLogsResponse } from './dto/index.js'
import { DEFAULT_SUBSCRIPTION_LOG_LIST_LIMIT } from './subscription-log.js'
import * as subscriptionLogRepository from './subscription-log.repository.js'
import { SubscriptionNotFoundError } from '../subscription/subscription.errors.js'
import * as subscriptionRepository from '../subscription/subscription.repository.js'
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
      (request.limit ??= DEFAULT_SUBSCRIPTION_LOG_LIST_LIMIT)
    )

    return {
      message: `SubscriptionLogs successfully listed`,
      statusCode: 200,
      subscriptionLogs: subscriptionLogRepository.buildCollection(subscriptionLogRows),
      limit: request.limit
    }
  })
}
