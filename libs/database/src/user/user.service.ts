import { Notify } from '@avito-speculant/notify'
import {
  AuthorizeUserRequest,
  AuthorizeUserResponse,
  ListUsersRequest,
  ListUsersResponse,
  QueueUsersRequest,
  QueueUsersResponse,
  BusinessUserRequest,
  BusinessUserResponse
} from './dto/index.js'
import { DEFAULT_USER_LIST_ALL, DEFAULT_USER_QUEUE_LIMIT, User } from './user.js'
import { UserNotFoundError } from './user.errors.js'
import * as userRepository from './user.repository.js'
import * as userLogRepository from '../user-log/user-log.repository.js'
import * as subscriptionRepository from '../subscription/subscription.repository.js'
import * as categoryRepository from '../category/category.repository.js'
import { KyselyDatabase } from '../database.js'

/**
 * Authorize User
 */
export async function authorizeUser(
  db: KyselyDatabase,
  request: AuthorizeUserRequest
): Promise<AuthorizeUserResponse> {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const existsUserRow = await userRepository.selectRowByTgFromIdForShare(trx, request.tgFromId)

    if (existsUserRow !== undefined) {
      const subscriptionRow = await subscriptionRepository.selectRowByUserIdStatusForShare(
        trx,
        existsUserRow.id,
        'active'
      )

      return {
        message: `User successfully authorized`,
        statusCode: 200,
        user: userRepository.buildModel(existsUserRow),
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

    const userRows = await userRepository.selectRowsList(
      trx,
      (request.all ??= DEFAULT_USER_LIST_ALL)
    )

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

    const userRows = await userRepository.selectRowsSkipLockedForUpdate(
      trx,
      (request.limit ??= DEFAULT_USER_QUEUE_LIMIT)
    )

    for (const userRow of userRows) {
      const updatedUserRow = await userRepository.updateRowQueuedId(trx, userRow.id)

      users.push(userRepository.buildModel(updatedUserRow))
    }

    return {
      message: `Users successfully enqueued`,
      statusCode: 200,
      users,
      limit: request.limit
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

    const userRow = await userRepository.selectRowByIdForUpdate(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError<BusinessUserRequest>(request)
    }

    if (userRow.status === 'paid') {
      // TODO
    }

    const { subscriptions } = await subscriptionRepository.selectCountByUserId(trx, userRow.id)

    if (userRow.subscriptions !== subscriptions) {
      isChanged = true

      userRow.subscriptions = subscriptions
    }

    const { categories } = await categoryRepository.selectCountByUserId(trx, userRow.id)

    if (userRow.categories !== categories) {
      isChanged = true

      userRow.categories = categories
    }

    // ...

    if (!isChanged) {
      return {
        message: `User not changed`,
        statusCode: 200,
        user: userRepository.buildModel(userRow),
        backLog
      }
    }

    const updatedUserRow = await userRepository.updateRowBusiness(
      trx,
      userRow.id,
      userRow.status,
      userRow.subscriptions,
      userRow.categories
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
  })
}
