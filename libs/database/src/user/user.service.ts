import { Notify } from '@avito-speculant/notify'
import {
  AuthorizeUserRequest,
  AuthorizeUserResponse,
  ListUsersRequest,
  ListUsersResponse,
  ProduceUsersRequest,
  ProduceUsersResponse,
  ConsumeUserRequest,
  ConsumeUserResponse
} from './dto/index.js'
import { User } from './user.js'
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

    const userRows = await userRepository.selectRowsList(trx, request.all ?? false)

    return {
      users: userRepository.buildCollection(userRows)
    }
  })
}

/**
 * Produce Users
 */
export async function produceUsers(
  db: KyselyDatabase,
  request: ProduceUsersRequest
): Promise<ProduceUsersResponse> {
  return await db.transaction().execute(async (trx) => {
    const users: User[] = []

    const userRows = await userRepository.selectRowsSkipLockedForUpdate(trx, request.limit)

    for (const userRow of userRows) {
      const updatedUserRow = await userRepository.updateRowProduce(trx, userRow.id)

      users.push(userRepository.buildModel(updatedUserRow))
    }

    return { users }
  })
}

/**
 * Consume User
 */
export async function consumeUser(
  db: KyselyDatabase,
  request: ConsumeUserRequest
): Promise<ConsumeUserResponse> {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []
    let isChanged = false

    const userRow = await userRepository.selectRowByIdForUpdate(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError<ConsumeUserRequest>(request)
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
        user: userRepository.buildModel(userRow),
        backLog
      }
    }

    const updatedUserRow = await userRepository.updateRowConsume(
      trx,
      userRow.id,
      userRow.status,
      userRow.subscriptions,
      userRow.categories
    )

    const userLogRow = await userLogRepository.insertRow(
      trx,
      updatedUserRow.id,
      'consume_user',
      updatedUserRow.status,
      updatedUserRow.subscriptions,
      updatedUserRow.categories,
      request.data
    )

    backLog.push(userLogRepository.buildNotify(userLogRow))

    return {
      user: userRepository.buildModel(updatedUserRow),
      backLog
    }
  })
}
