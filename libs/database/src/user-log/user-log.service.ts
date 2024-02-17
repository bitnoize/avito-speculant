import { UserNotFoundError } from '@avito-speculant/domain'
import { ListUserLogsRequest, ListUserLogsResponse } from './dto/list-user-logs.js'
import * as userRepository from '../user/user.repository.js'
import * as userLogRepository from './user-log.repository.js'
import { KyselyDatabase } from '../database.js'

/*
 * List UserLogs
 */
export async function listUserLogs(
  db: KyselyDatabase,
  request: ListUserLogsRequest
): Promise<ListUserLogsResponse> {
  return await db.transaction().execute(async (trx) => {
    const userRow = await userRepository.selectRowByIdForShare(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError<ListUserLogsRequest>(request)
    }

    const userLogRows = await userLogRepository.selectRowsByUserId(
      trx,
      userRow.id,
      request.limit
    )

    return {
      message: `UserLogs successfully listed`,
      statusCode: 200,
      userLogs: userLogRepository.buildCollection(userLogRows),
      limit: request.limit
    }
  })
}
