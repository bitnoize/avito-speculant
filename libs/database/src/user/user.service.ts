import { AuthorizeUserRequest, AuthorizeUserResponse } from './dto/authorize-user.js'
import { ListUsersRequest, ListUsersResponse } from './dto/list-users.js'
import { QueueUsersRequest, QueueUsersResponse } from './dto/queue-users.js'
import { BusinessUserRequest, BusinessUserResponse } from './dto/business-user.js'
import { User } from './user.js'
import { UserNotFoundError } from './user.errors.js'
import * as userRepository from './user.repository.js'
import * as userLogRepository from '../user-log/user-log.repository.js'
import * as subscriptionRepository from '../subscription/subscription.repository.js'
import * as categoryRepository from '../category/category.repository.js'
import { KyselyDatabase, Notify } from '../database.js'

/**
 * Authorize User
 */
export async function authorizeUser(
  db: KyselyDatabase,
  request: AuthorizeUserRequest
): Promise<AuthorizeUserResponse> {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const selectedUserRow = await userRepository.selectRowByTgFromIdForShare(trx, request.tgFromId)

    if (selectedUserRow !== undefined) {
      const subscriptionRow = await subscriptionRepository.selectRowByUserIdStatusForShare(
        trx,
        selectedUserRow.id,
        'active' // FIXME
      )

      return {
        message: `User allready exists`,
        statusCode: 200,
        user: userRepository.buildModel(selectedUserRow),
        subscription:
          subscriptionRow !== undefined
            ? subscriptionRepository.buildModel(subscriptionRow)
            : undefined,
        backLog
      }
    }

    // ...

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
    // ...

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
  db: KyselyDatabase,
  request: QueueUsersRequest
): Promise<QueueUsersResponse> {
  return await db.transaction().execute(async (trx) => {
    const users: User[] = []

    const selectedUserRows = await userRepository.selectRowsSkipLockedForUpdate(trx, request.limit)

    for (const userRow of selectedUserRows) {
      const updatedUserRow = await userRepository.updateRowQueuedId(trx, userRow.id)

      users.push(userRepository.buildModel(updatedUserRow))
    }

    return {
      message: `Users successfully queued`,
      statusCode: 200,
      users
    }
  })
}

/**
 * Business User
 */
export async function businessUser(
  db: KyselyDatabase,
  request: BusinessUserRequest
): Promise<BusinessUserResponse> {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []
    let isChanged = false

    const selectedUserRow = await userRepository.selectRowByIdForUpdate(trx, request.userId)

    if (selectedUserRow === undefined) {
      throw new UserNotFoundError<BusinessUserRequest>(request)
    }

    if (selectedUserRow.status === 'paid') {
      // TODO
    }

    const { subscriptions } = await subscriptionRepository.selectCountByUserId(
      trx,
      selectedUserRow.id
    )

    if (selectedUserRow.subscriptions !== subscriptions) {
      isChanged = true

      selectedUserRow.subscriptions = subscriptions
    }

    const { categories } = await categoryRepository.selectCountByUserId(trx, selectedUserRow.id)

    if (selectedUserRow.categories !== categories) {
      isChanged = true

      selectedUserRow.categories = categories
    }

    if (isChanged) {
      const updatedUserRow = await userRepository.updateRowBusiness(
        trx,
        selectedUserRow.id,
        selectedUserRow.status,
        selectedUserRow.subscriptions,
        selectedUserRow.categories
      )

      const userLogRow = await userLogRepository.insertRow(
        trx,
        updatedUserRow.id,
        'business_user',
        updatedUserRow.status,
        updatedUserRow.subscriptions,
        updatedUserRow.categories,
        request.data
      )

      backLog.push(userLogRepository.buildNotify(userLogRow))

      return {
        message: `User successfully processed`,
        statusCode: 201,
        user: userRepository.buildModel(updatedUserRow),
        backLog
      }
    }

    return {
      message: `User successfully processed`,
      statusCode: 200,
      user: userRepository.buildModel(selectedUserRow),
      backLog
    }
  })
}
