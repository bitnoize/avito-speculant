import { ListSubscriptionLogs } from './dto/index.js'
import * as subscriptionLogRepository from './subscription-log.repository.js'
import { SubscriptionNotFoundError } from '../subscription/subscription.errors.js'
import * as subscriptionRepository from '../subscription/subscription.repository.js'

/*
 * List SubscriptionLogs
 */
export const listSubscriptionLogs: ListSubscriptionLogs = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const subscriptionRow = await subscriptionRepository.selectRowById(
      trx,
      request.subscriptionId
    )

    if (subscriptionRow === undefined) {
      throw new SubscriptionNotFoundError({ request })
    }

    const subscriptionLogRows = await subscriptionLogRepository.selectRowsBySubscriptionId(
      trx,
      subscriptionRow.id,
      request.limit
    )

    return {
      subscriptionLogs: subscriptionLogRepository.buildCollection(subscriptionLogRows)
    }
  })
}
