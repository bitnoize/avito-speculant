import { Notify } from '@avito-speculant/common'
import { AuthorizeUser, ProduceUsers, ConsumeUser } from './dto/index.js'
import { UserNotFoundError } from './user.errors.js'
import * as userRepository from './user.repository.js'
import * as userLogRepository from '../user-log/user-log.repository.js'
import * as subscriptionRepository from '../subscription/subscription.repository.js'
import * as categoryRepository from '../category/category.repository.js'
import * as botRepository from '../bot/bot.repository.js'

/**
 * Authorize User
 */
export const authorizeUser: AuthorizeUser = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const existsUserRow = await userRepository.selectRowByTgFromId(trx, request.tgFromId)

    if (existsUserRow !== undefined) {
      const activeSubscriptionRow = await subscriptionRepository.selectRowByUserIdStatus(
        trx,
        existsUserRow.id,
        'active'
      )

      if (activeSubscriptionRow !== undefined) {
        existsUserRow.active_subscription_id = activeSubscriptionRow.id

        return {
          user: userRepository.buildModel(existsUserRow),
          subscription: subscriptionRepository.buildModel(activeSubscriptionRow),
          backLog
        }
      } else {
        existsUserRow.active_subscription_id = null

        return {
          user: userRepository.buildModel(existsUserRow),
          backLog
        }
      }
    }

    const instertedUserRow = await userRepository.insertRow(trx, request.tgFromId)

    const userLogRow = await userLogRepository.insertRow(
      trx,
      instertedUserRow.id,
      'create_user',
      instertedUserRow.active_subscription_id,
      instertedUserRow.subscriptions,
      instertedUserRow.categories,
      instertedUserRow.bots,
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
 * Produce Users
 */
export const produceUsers: ProduceUsers = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const userRows = await userRepository.selectRowsProduce(trx, request.limit)

    const updatedUserRows = await userRepository.updateRowsProduce(
      trx,
      userRows.map((userRow) => userRow.id)
    )

    return {
      users: userRepository.buildCollection(updatedUserRows)
    }
  })
}

/**
 * Consume User
 */
export const consumeUser: ConsumeUser = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    let modified = false

    const userRow = await userRepository.selectRowById(trx, request.entityId, true)

    if (userRow === undefined) {
      throw new UserNotFoundError({ request })
    }

    const activeSubscriptionRow = await subscriptionRepository.selectRowByUserIdStatus(
      trx,
      userRow.id,
      'active'
    )

    if (activeSubscriptionRow !== undefined) {
      if (userRow.active_subscription_id !== activeSubscriptionRow.id) {
        userRow.active_subscription_id = activeSubscriptionRow.id

        modified = true
      }
    } else {
      if (userRow.active_subscription_id !== null) {
        userRow.active_subscription_id = null

        modified = true
      }
    }

    userRow.subscriptions = await subscriptionRepository.selectCountByUserId(trx, userRow.id)
    userRow.categories = await categoryRepository.selectCountByUserId(trx, userRow.id)
    userRow.bots = await botRepository.selectCountByUserId(trx, userRow.id)

    await userRepository.updateRowCounters(
      trx,
      userRow.id,
      userRow.subscriptions,
      userRow.categories,
      userRow.bots
    )

    if (!modified) {
      return {
        user: userRepository.buildModel(userRow),
        backLog
      }
    }

    const updatedUserRow = await userRepository.updateRowState(
      trx,
      userRow.id,
      userRow.active_subscription_id
    )

    const userLogRow = await userLogRepository.insertRow(
      trx,
      updatedUserRow.id,
      'consume_user',
      updatedUserRow.active_subscription_id,
      updatedUserRow.subscriptions,
      updatedUserRow.categories,
      updatedUserRow.bots,
      request.data
    )

    backLog.push(userLogRepository.buildNotify(userLogRow))

    return {
      user: userRepository.buildModel(updatedUserRow),
      backLog
    }
  })
}
