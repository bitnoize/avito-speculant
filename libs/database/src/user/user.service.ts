import { Notify, User } from '@avito-speculant/domain'
import {
  AuthorizeUserRequest,
  AuthorizeUserResponse
} from './dto/authorize-user.js'
import {
  ListUsersRequest,
  ListUsersResponse
} from './dto/list-users.js'
import {
  ScheduleUsersRequest,
  ScheduleUsersResponse
} from './dto/schedule-users.js'
import * as userRepository from './user.repository.js'
import * as userLogRepository from '../user-log/user-log.repository.js'
import * as subscriptionRepository from '../subscription/subscription.repository.js'
import * as categoryRepository from '../category/category.repository.js'
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
 * Schedule Users
 */
export async function scheduleUsers(
  trx: TransactionDatabase,
  request: ScheduleUsersRequest
): Promise<ScheduleUsersResponse> {
  const users: User[] = []
  const backLog: Notify[] = []

  const selectedUserRows = await userRepository.selectRowsSkipLockedForUpdate(
    trx,
    request.limit
  )

  if (selectedUserRows.length === 0) {
    return {
      message: `No users pending to schedule`,
      statusCode: 200,
      users,
      backLog
    }
  }

  for (const userRow of selectedUserRows) {
    let isChanged = false

    const { subscriptions } = await subscriptionRepository.selectCountByUserId(
      trx,
      userRow.id
    )

    if (userRow.subscriptions !== subscriptions) {
      isChanged = true

      userRow.subscriptions = subscriptions
    }

    const { categories } = await categoryRepository.selectCountByUserId(
      trx,
      userRow.id
    )

    if (userRow.categories !== categories) {
      isChanged = true

      userRow.categories = categories
    }

    if (isChanged) {
      const updatedUserRow = await userRepository.updateRowScheduleChange(
        trx,
        userRow.id,
        userRow.status,
        userRow.subscriptions,
        userRow.categories
      )

      users.push(userRepository.buildModel(updatedUserRow))

      const userLogRow = await userLogRepository.insertRow(
        trx,
        updatedUserRow.id,
        'schedule_user',
        updatedUserRow.status,
        updatedUserRow.subscriptions,
        updatedUserRow.categories,
        request.data
      )

      backLog.push(userLogRepository.buildNotify(userLogRow))
    } else {
      const updatedUserRow = await userRepository.updateRowSchedule(trx, userRow.id)

      users.push(userRepository.buildModel(updatedUserRow))
    }
  }

  return {
    message: `Users ready to schedule`,
    statusCode: 201,
    users,
    backLog
  }
}
