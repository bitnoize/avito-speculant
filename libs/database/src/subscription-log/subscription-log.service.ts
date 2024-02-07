import { Kysely } from 'kysely'
// SubscriptionLog
import {
  SubscriptionLog,
  ListSubscriptionLogsRequest
} from './subscription-log.js'
import * as subscriptionLogRepository from './subscription-log.repository.js'
// Common
import { Database } from '../database.js'

export async function listSubscriptionLogs(
  db: Kysely<Database>,
  request: ListSubscriptionLogsRequest
): Promise<ListSubscriptionLogsResponse> {
  return await db.transaction().execute(async (trx) => {
    const userRow = await userRepository.selectRowByIdForShare(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError(request, `listUserLogs: user not found`)
    }

    const userLogRows = await userLogRepository.selectRowsByUserId(
      trx,
      userRow.id,
      request.limit
    )


    return {
      message: `listUserLogs: successfully listed`,
      statusCode: 200,
      user: userRepository.buildModel(userRow),
      userLogs: userLogRepository.buildCollection(userLogRows),
      limit
    }
  })



  const subscriptionLogRows = await subscriptionLogRepository.selectBySubscriptionId(
    db,
    request.subscriptionId
  )

  return makeSubscriptionLogsFromRows(subscriptionLogRows)
}

