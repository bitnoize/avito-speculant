import { ListUserLogs } from './dto/index.js'
import * as userLogRepository from './user-log.repository.js'
import { UserNotFoundError } from '../user/user.errors.js'
import * as userRepository from '../user/user.repository.js'

/*
 * List UserLogs
 */
export const listUserLogs: ListUserLogs = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const userRow = await userRepository.selectRowByIdForShare(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError({ request })
    }

    const userLogRows = await userLogRepository.selectRowsList(trx, userRow.id, request.limit)

    return {
      userLogs: userLogRepository.buildCollection(userLogRows)
    }
  })
}
