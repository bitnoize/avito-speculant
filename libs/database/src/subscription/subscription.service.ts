import { Notify } from '@avito-speculant/common'
import {
  CreateSubscription,
  CancelSubscription,
  ActivateSubscription,
  ProduceSubscriptions,
  ConsumeSubscription
} from './dto/index.js'
import { Subscription } from './subscription.js'
import {
  SubscriptionNotFoundError,
  SubscriptionExistsError,
  SubscriptionNotWaitError,
  SubscriptionIsCancelError,
  SubscriptionIsActiveError
} from './subscription.errors.js'
import * as subscriptionRepository from './subscription.repository.js'
import * as subscriptionLogRepository from '../subscription-log/subscription-log.repository.js'
import { UserNotFoundError } from '../user/user.errors.js'
import * as userRepository from '../user/user.repository.js'
import { PlanNotFoundError, PlanIsDisabledError } from '../plan/plan.errors.js'
import * as planRepository from '../plan/plan.repository.js'

/**
 * Create Subscription
 */
export const createSubscription: CreateSubscription = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const userRow = await userRepository.selectRowById(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError({ request })
    }

    const planRow = await planRepository.selectRowById(trx, request.planId)

    if (planRow === undefined) {
      throw new PlanNotFoundError({ request })
    }

    if (!planRow.is_enabled) {
      throw new PlanIsDisabledError({ request, planRow })
    }

    const waitSubscriptionRow = await subscriptionRepository.selectRowByUserIdStatus(
      trx,
      userRow.id,
      'wait'
    )

    if (waitSubscriptionRow !== undefined) {
      throw new SubscriptionExistsError({ request, waitSubscriptionRow })
    }

    const activeSubscriptionRow = await subscriptionRepository.selectRowByUserIdStatus(
      trx,
      userRow.id,
      'active'
    )

    if (activeSubscriptionRow !== undefined) {
      if (planRow.price_rub > 500) {
        // Small bonus
        planRow.price_rub = planRow.price_rub - 100
      }
    }

    const insertedSubscriptionRow = await subscriptionRepository.insertRow(
      trx,
      userRow.id,
      planRow.id,
      planRow.duration_days,
      planRow.price_rub
    )

    const subscriptionLogRow = await subscriptionLogRepository.insertRow(
      trx,
      insertedSubscriptionRow.id,
      'create_subscription',
      insertedSubscriptionRow.status,
      request.data
    )

    backLog.push(subscriptionLogRepository.buildNotify(subscriptionLogRow))

    return {
      subscription: subscriptionRepository.buildModel(insertedSubscriptionRow),
      backLog
    }
  })
}

/**
 * Cancel Subscription
 */
export const cancelSubscription: CancelSubscription = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const userRow = await userRepository.selectRowById(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError({ request })
    }

    const subscriptionRow = await subscriptionRepository.selectRowByIdUserId(
      trx,
      request.subscriptionId,
      userRow.id,
      true
    )

    if (subscriptionRow === undefined) {
      throw new SubscriptionNotFoundError({ request })
    }

    if (subscriptionRow.status === 'cancel') {
      throw new SubscriptionIsCancelError({ request, subscriptionRow })
    }

    if (subscriptionRow.status !== 'wait') {
      throw new SubscriptionNotWaitError({ request, subscriptionRow })
    }

    subscriptionRow.status = 'cancel'

    const updatedSubscriptionRow = await subscriptionRepository.updateRowState(
      trx,
      subscriptionRow.id,
      subscriptionRow.status
    )

    const subscriptionLogRow = await subscriptionLogRepository.insertRow(
      trx,
      updatedSubscriptionRow.id,
      'cancel_subscription',
      updatedSubscriptionRow.status,
      request.data
    )

    backLog.push(subscriptionLogRepository.buildNotify(subscriptionLogRow))

    return {
      subscription: subscriptionRepository.buildModel(updatedSubscriptionRow),
      backLog
    }
  })
}

/**
 * Activate Subscription
 */
export const activateSubscription: ActivateSubscription = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const userRow = await userRepository.selectRowById(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError({ request })
    }

    const subscriptionRow = await subscriptionRepository.selectRowByIdUserId(
      trx,
      request.subscriptionId,
      userRow.id,
      true
    )

    if (subscriptionRow === undefined) {
      throw new SubscriptionNotFoundError({ request })
    }

    if (subscriptionRow.status === 'active') {
      throw new SubscriptionIsActiveError({ request, subscriptionRow })
    }

    if (subscriptionRow.status !== 'wait') {
      throw new SubscriptionNotWaitError({ request, subscriptionRow })
    }

    let previousSubscription: Subscription | undefined = undefined

    const activeSubscriptionRow = await subscriptionRepository.selectRowByUserIdStatus(
      trx,
      userRow.id,
      'active',
      true
    )

    if (activeSubscriptionRow !== undefined) {
      activeSubscriptionRow.status = 'finish'

      const updatedSubscriptionRow = await subscriptionRepository.updateRowState(
        trx,
        activeSubscriptionRow.id,
        activeSubscriptionRow.status
      )

      const subscriptionLogRow = await subscriptionLogRepository.insertRow(
        trx,
        updatedSubscriptionRow.id,
        'activate_subscription',
        updatedSubscriptionRow.status,
        request.data
      )

      backLog.push(subscriptionLogRepository.buildNotify(subscriptionLogRow))

      previousSubscription = subscriptionRepository.buildModel(updatedSubscriptionRow)
    }

    userRow.active_subscription_id = subscriptionRow.id

    subscriptionRow.status = 'active'

    const updatedSubscriptionRow = await subscriptionRepository.updateRowState(
      trx,
      subscriptionRow.id,
      subscriptionRow.status
    )

    const subscriptionLogRow = await subscriptionLogRepository.insertRow(
      trx,
      updatedSubscriptionRow.id,
      'activate_subscription',
      updatedSubscriptionRow.status,
      request.data
    )

    backLog.push(subscriptionLogRepository.buildNotify(subscriptionLogRow))

    return {
      user: userRepository.buildModel(userRow),
      subscription: subscriptionRepository.buildModel(updatedSubscriptionRow),
      previousSubscription,
      backLog
    }
  })
}

/**
 * Produce Subscriptions
 */
export const produceSubscriptions: ProduceSubscriptions = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const subscriptionRows = await subscriptionRepository.selectRowsProduce(trx, request.limit)

    const updatedSubscriptionRows = await subscriptionRepository.updateRowsProduce(
      trx,
      subscriptionRows.map((subscriptionRow) => subscriptionRow.id)
    )

    return {
      subscriptions: subscriptionRepository.buildCollection(updatedSubscriptionRows)
    }
  })
}

/**
 * Consume Subscription
 */
export const consumeSubscription: ConsumeSubscription = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    let modified = false

    const subscriptionRow = await subscriptionRepository.selectRowById(trx, request.entityId, true)

    if (subscriptionRow === undefined) {
      throw new SubscriptionNotFoundError({ request })
    }

    const userRow = await userRepository.selectRowById(trx, subscriptionRow.user_id)

    if (userRow === undefined) {
      throw new UserNotFoundError({ request, subscriptionRow }, 100)
    }

    if (subscriptionRow.status === 'wait') {
      if (subscriptionRow.queued_at > subscriptionRow.timeout_at) {
        subscriptionRow.status = 'cancel'

        modified = true
      }
    } else if (subscriptionRow.status === 'active') {
      if (subscriptionRow.queued_at > subscriptionRow.finish_at) {
        subscriptionRow.status = 'finish'

        modified = true
      }
    }

    if (!modified) {
      return {
        subscription: subscriptionRepository.buildModel(subscriptionRow),
        backLog
      }
    }

    const updatedSubscriptionRow = await subscriptionRepository.updateRowState(
      trx,
      subscriptionRow.id,
      subscriptionRow.status
    )

    const subscriptionLogRow = await subscriptionLogRepository.insertRow(
      trx,
      updatedSubscriptionRow.id,
      'consume_subscription',
      updatedSubscriptionRow.status,
      request.data
    )

    backLog.push(subscriptionLogRepository.buildNotify(subscriptionLogRow))

    return {
      subscription: subscriptionRepository.buildModel(updatedSubscriptionRow),
      backLog
    }
  })
}
