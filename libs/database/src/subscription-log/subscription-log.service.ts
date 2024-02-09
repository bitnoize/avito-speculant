import { Kysely } from 'kysely'
// Subscription
import { SubscriptionNotFoundError } from '../subscription/subscription.errors.js'
import * as subscriptionRepository from '../subscription/subscription.repository.js'
// SubscriptionLog
import {
  ListSubscriptionLogsRequest,
  ListSubscriptionLogsResponse
} from './subscription-log.js'
import * as subscriptionLogRepository from './subscription-log.repository.js'
// Common
import { Database } from '../database.js'

export async function listSubscriptionLogs(
  db: Kysely<Database>,
  request: ListSubscriptionLogsRequest
): Promise<ListSubscriptionLogsResponse> {
  return await db.transaction().execute(async (trx) => {
    const subscriptionRow = await subscriptionRepository.selectRowByIdForShare(
      trx,
      request.subscriptionId
    )

    if (subscriptionRow === undefined) {
      throw new SubscriptionNotFoundError(request, 400)
    }

    const subscriptionLogRows =
      await subscriptionLogRepository.selectRowsBySubscriptionId(
        trx,
        subscriptionRow.id,
        request.limit
      )

    return {
      message: `SubscriptionLogs listed successfully`,
      statusCode: 200,
      subscriptionLogs:
        subscriptionLogRepository.buildCollection(subscriptionLogRows),
      limit: request.limit
    }
  })
}
