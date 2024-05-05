import { Notify } from '@avito-speculant/common'
import { AuthorizeUser, ListUsers, ProduceUsers, ConsumeUser } from './dto/index.js'
import { UserNotFoundError } from './user.errors.js'
import * as userRepository from './user.repository.js'
import * as userLogRepository from '../user-log/user-log.repository.js'
import { Plan } from '../plan/plan.js'
import { PlanNotFoundError } from '../plan/plan.errors.js'
import * as planRepository from '../plan/plan.repository.js'
import { Subscription } from '../subscription/subscription.js'
import * as subscriptionRepository from '../subscription/subscription.repository.js'
import * as categoryRepository from '../category/category.repository.js'
import * as botRepository from '../bot/bot.repository.js'

/**
 * Authorize User
 */
export const authorizeUser: AuthorizeUser = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    let subscription: Subscription | undefined = undefined
    let plan: Plan | undefined = undefined

    const backLog: Notify[] = []

    const existsUserRow = await userRepository.selectRowByTgFromId(trx, request.tgFromId)

    if (existsUserRow !== undefined) {
      const activeSubscriptionRow = await subscriptionRepository.selectRowByUserIdStatus(
        trx,
        existsUserRow.id,
        'active'
      )

      if (activeSubscriptionRow !== undefined) {
        subscription = subscriptionRepository.buildModel(activeSubscriptionRow)

        const planRow = await planRepository.selectRowById(trx, activeSubscriptionRow.plan_id)

        if (planRow === undefined) {
          throw new PlanNotFoundError({ request, activeSubscriptionRow }, 100)
        }

        plan = planRepository.buildModel(planRow)

        existsUserRow.is_paid = true
      } else {
        existsUserRow.is_paid = false
      }

      return {
        user: userRepository.buildModel(existsUserRow),
        subscription,
        plan,
        backLog
      }
    }

    const instertedUserRow = await userRepository.insertRow(trx, request.tgFromId)

    const userLogRow = await userLogRepository.insertRow(
      trx,
      instertedUserRow.id,
      'create_user',
      instertedUserRow.is_paid,
      instertedUserRow.subscriptions,
      instertedUserRow.categories,
      instertedUserRow.bots,
      request.data
    )

    backLog.push(userLogRepository.buildNotify(userLogRow))

    return {
      user: userRepository.buildModel(instertedUserRow),
      subscription,
      plan,
      backLog
    }
  })
}

/**
 * List Users
 */
export const listUsers: ListUsers = async function (db) {
  return await db.transaction().execute(async (trx) => {
    const userRows = await userRepository.selectRows(trx)

    return {
      users: userRepository.buildCollection(userRows)
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
    let subscription: Subscription | undefined = undefined
    let plan: Plan | undefined = undefined

    const backLog: Notify[] = []

    let modified = false

    const userRow = await userRepository.selectRowById(trx, request.userId, true)

    if (userRow === undefined) {
      throw new UserNotFoundError({ request })
    }

    const activeSubscriptionRow = await subscriptionRepository.selectRowByUserIdStatus(
      trx,
      userRow.id,
      'active'
    )

    if (activeSubscriptionRow !== undefined) {
      subscription = subscriptionRepository.buildModel(activeSubscriptionRow)

      const planRow = await planRepository.selectRowById(trx, activeSubscriptionRow.plan_id)

      if (planRow === undefined) {
        throw new PlanNotFoundError({ request, activeSubscriptionRow }, 100)
      }

      plan = planRepository.buildModel(planRow)

      if (!userRow.is_paid) {
        userRow.is_paid = true

        modified = true
      }
    } else {
      if (userRow.is_paid) {
        userRow.is_paid = false

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
        subscription,
        plan,
        backLog
      }
    }

    const updatedUserRow = await userRepository.updateRowState(trx, userRow.id, userRow.is_paid)

    const userLogRow = await userLogRepository.insertRow(
      trx,
      updatedUserRow.id,
      'consume_user',
      updatedUserRow.is_paid,
      updatedUserRow.subscriptions,
      updatedUserRow.categories,
      updatedUserRow.bots,
      request.data
    )

    backLog.push(userLogRepository.buildNotify(userLogRow))

    return {
      user: userRepository.buildModel(updatedUserRow),
      subscription,
      plan,
      backLog
    }
  })
}
