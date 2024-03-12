import { ListUserLogsRequest, ListUserLogsResponse } from './dto/index.js'
import { DEFAULT_USER_LOG_LIST_LIMIT } from './user-log.js'
import * as userLogRepository from './user-log.repository.js'
import { UserNotFoundError } from '../user/user.errors.js'
import * as userRepository from '../user/user.repository.js'
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

    const userLogRows = await userLogRepository.selectRowsList(
      trx,
      userRow.id,
      (request.limit ??= DEFAULT_USER_LOG_LIST_LIMIT)
    )

    return {
      userLogs: userLogRepository.buildCollection(userLogRows),
      limit: request.limit
    }
  })
}
