import { Kysely } from 'kysely'
// User
import { UserNotFoundError } from '../user/user.errors.js'
import * as userRepository from '../user/user.repository.js'
// UserLog
import { ListUserLogsRequest, ListUserLogsResponse } from './user-log.js'
import * as userLogRepository from './user-log.repository.js'
// Common
import { Database } from '../database.js'

export async function listUserLogs(
  db: Kysely<Database>,
  request: ListUserLogsRequest
): Promise<ListUserLogsResponse> {
  return await db.transaction().execute(async (trx) => {
    const userRow = await userRepository.selectRowByIdForShare(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError(request, 400)
    }

    const userLogRows = await userLogRepository.selectRowsByUserId(
      trx,
      userRow.id,
      request.limit
    )

    return {
      message: `UserLogs listed successfully`,
      statusCode: 200,
      userLogs: userLogRepository.buildCollection(userLogRows),
      limit: request.limit
    }
  })
}
