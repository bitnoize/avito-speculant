import { Notify, User } from '@avito-speculant/domain'
import {
  AuthorizeUserRequest,
  AuthorizeUserResponse
} from './dto/authorize-user.js'
import { ListUsersRequest, ListUsersResponse } from './dto/list-users.js'
import { QueueUsersRequest, QueueUsersResponse } from './dto/queue-users.js'
import * as userRepository from './user.repository.js'
import * as userLogRepository from '../user-log/user-log.repository.js'
import { KyselyDatabase, TransactionDatabase } from '../database.js'

/**
 * Authorize User
 */
export async function authorizeUser(
  db: KyselyDatabase,
  request: AuthorizeUserRequest
): Promise<AuthorizeUserResponse> {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const selectedUserRow = await userRepository.selectRowByTgFromIdForShare(
      trx,
      request.tgFromId
    )

    if (selectedUserRow !== undefined) {
      return {
        message: `User allready exists`,
        statusCode: 200,
        user: userRepository.buildModel(selectedUserRow),
        backLog
      }
    }

    const instertedUserRow = await userRepository.insertRow(trx, request.tgFromId)

    const userLogRow = await userLogRepository.insertRow(
      trx,
      instertedUserRow.id,
      'create_user',
      instertedUserRow.status,
      instertedUserRow.subscriptions,
      instertedUserRow.categories,
      request.data
    )

    backLog.push(userLogRepository.buildNotify(userLogRow))

    return {
      message: `User successfully created`,
      statusCode: 201,
      user: userRepository.buildModel(instertedUserRow),
      backLog
    }
  })
}

/**
 * List Users
 */
export async function listUsers(
  db: KyselyDatabase,
  request: ListUsersRequest
): Promise<ListUsersResponse> {
  return await db.transaction().execute(async (trx) => {
    const userRows = await userRepository.selectRowsList(trx, request.all)

    return {
      message: `Users successfully listed`,
      statusCode: 200,
      users: userRepository.buildCollection(userRows),
      all: request.all
    }
  })
}

/**
 * Queue Users
 */
export async function queueUsers(
  trx: TransactionDatabase,
  request: QueueUsersRequest
): Promise<QueueUsersResponse> {
  const users: User[] = []

  const selectedUserRows = await userRepository.selectRowsSkipLockedForUpdate(
    trx,
    request.limit
  )

  for (const userRow of selectedUserRows) {
    const updatedUserRow = await userRepository.updateRowQueuedAt(trx, userRow.id)

    users.push(userRepository.buildModel(updatedUserRow))
  }

  return {
    message: `Users successfully queued`,
    statusCode: 200,
    users
  }
}
