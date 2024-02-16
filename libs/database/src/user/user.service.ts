import { Notify, User } from '@avito-speculant/domain'
import { AuthorizeUserRequest, AuthorizeUserResponse } from './dto/authorize-user.js'
import { ScheduleUsersRequest, ScheduleUsersResponse } from './dto/schedule-users.js'
import * as userRepository from './user.repository.js'
import * as userLogRepository from '../user-log/user-log.repository.js'
import * as subscriptionRepository from '../subscription/subscription.repository.js'
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

    const existsUserRow = await userRepository.selectRowByTgFromIdForShare(
      trx,
      request.tgFromId
    )

    if (existsUserRow !== undefined) {
      return {
        message: `User allready exists`,
        statusCode: 200,
        user: userRepository.buildModel(existsUserRow),
        backLog
      }
    }

    const userRow = await userRepository.insertRow(trx, request.tgFromId)

    const userLogRow = await userLogRepository.insertRow(
      trx,
      'authorize_user',
      userRow,
      request.data
    )

    backLog.push(['user', userLogRepository.buildNotify(userLogRow)])

    return {
      message: `User successfully created`,
      statusCode: 201,
      user: userRepository.buildModel(userRow),
      backLog
    }
  })
}

/**
 * Schedule Users
 */
export async function scheduleUsers(
  trx: TransactionDatabase,
  request: ScheduleUsersRequest
): Promise<ScheduleUsersResponse> {
  const selectedUserRows = await userRepository.selectRowsSkipLockedForUpdate(
    trx,
    request.limit
  )

  if (selectedUserRows.length === 0) {
    return {
      message: `No users pending to schedule`,
      statusCode: 200,
      users: [],
      backLog: []
    }
  }

  const users: User[] = []
  const backLog: Notify[] = []

  for (const userRow of selectedUserRows) {
    let isModified = false

    const { subscriptions } = await subscriptionRepository.selectCountByUserId(
      trx,
      userRow.id
    )

    if (userRow.subscriptions !== subscriptions) {
      isModified = true

      userRow.subscriptions = subscriptions
    }

    const updatedUserRow = await userRepository.updateRowScheduledAt(
      trx,
      userRow.id,
      userRow.status,
      userRow.subscriptions
    )

    users.push(userRepository.buildModel(userRow))

    if (isModified) {
      const userLogRow = await userLogRepository.insertRow(
        trx,
        'schedule_user',
        updatedUserRow,
        request.data
      )
    
      backLog.push(['user', userLogRepository.buildNotify(userLogRow)])
    }
  }

  return {
    message: `Users ready to schedule`,
    statusCode: 201,
    users,
    backLog
  }
}
