import { Notify } from '@avito-speculant/common'
import {
  CreateSubscription,
  ActivateSubscription,
  CancelSubscription,
  ListSubscriptions,
  ProduceSubscriptions,
  ConsumeSubscription
} from './dto/index.js'
import { Subscription } from './subscription.js'
import {
  SubscriptionNotFoundError,
  SubscriptionExistsError,
  SubscriptionNotWaitError
} from './subscription.errors.js'
import * as subscriptionRepository from './subscription.repository.js'
import * as subscriptionLogRepository from '../subscription-log/subscription-log.repository.js'
import { UserNotFoundError } from '../user/user.errors.js'
import * as userRepository from '../user/user.repository.js'
import * as userLogRepository from '../user-log/user-log.repository.js'
import { PlanNotFoundError, PlanIsDisabledError } from '../plan/plan.errors.js'
import * as planRepository from '../plan/plan.repository.js'

/**
 * Create Subscription
 */
export const createSubscription: CreateSubscription = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const userRow = await userRepository.selectRowByIdForShare(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError({ request })
    }

    const planRow = await planRepository.selectRowByIdForShare(trx, request.planId)

    if (planRow === undefined) {
      throw new PlanNotFoundError({ request })
    }

    if (!planRow.is_enabled) {
      throw new PlanIsDisabledError({ request })
    }

    const waitSubscriptionRow = await subscriptionRepository.selectRowByUserIdStatusForShare(
      trx,
      userRow.id,
      'wait'
    )

    if (waitSubscriptionRow !== undefined) {
      throw new SubscriptionExistsError({ request })
    }

    const activeSubscriptionRow = await subscriptionRepository.selectRowByUserIdStatusForShare(
      trx,
      userRow.id,
      'active'
    )

    if (activeSubscriptionRow !== undefined) {
      // ...
    }

    // ...

    const insertedSubscriptionRow = await subscriptionRepository.insertRow(
      trx,
      userRow.id,
      planRow.id,
      planRow.categories_max,
      planRow.price_rub,
      planRow.duration_days,
      planRow.interval_sec,
      planRow.analytics_on
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
 * Activate Subscription
 */
export const activateSubscription: ActivateSubscription = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const subscriptionRow = await subscriptionRepository.selectRowByIdForUpdate(
      trx,
      request.subscriptionId
    )

    if (subscriptionRow === undefined) {
      throw new SubscriptionNotFoundError({ request })
    }

    if (subscriptionRow.status !== 'wait') {
      throw new SubscriptionNotWaitError({ request })
    }

    const userRow = await userRepository.selectRowByIdForUpdate(trx, subscriptionRow.user_id)

    if (userRow === undefined) {
      throw new UserNotFoundError({ request }, 100)
    }

    // ...

    const updatedSubscriptionRow = await subscriptionRepository.updateRowStatus(
      trx,
      subscriptionRow.id,
      'active'
    )

    const subscriptionLogRow = await subscriptionLogRepository.insertRow(
      trx,
      updatedSubscriptionRow.id,
      'activate_subscription',
      updatedSubscriptionRow.status,
      request.data
    )

    backLog.push(subscriptionLogRepository.buildNotify(subscriptionLogRow))

    const updatedUserRow = await userRepository.updateRowIsPaid(trx, userRow.id, true)

    const userLogRow = await userLogRepository.insertRow(
      trx,
      updatedUserRow.id,
      'activate_subscription',
      updatedUserRow.is_paid,
      updatedUserRow.subscriptions,
      updatedUserRow.categories,
      request.data
    )

    backLog.push(userLogRepository.buildNotify(userLogRow))

    return {
      user: userRepository.buildModel(updatedUserRow),
      subscription: subscriptionRepository.buildModel(updatedSubscriptionRow),
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

    const subscriptionRow = await subscriptionRepository.selectRowByIdForUpdate(
      trx,
      request.subscriptionId
    )

    if (subscriptionRow === undefined) {
      throw new SubscriptionNotFoundError({ request })
    }

    if (subscriptionRow.status === 'cancel') {
      return {
        subscription: subscriptionRepository.buildModel(subscriptionRow),
        backLog
      }
    }

    if (subscriptionRow.status !== 'wait') {
      throw new SubscriptionNotWaitError({ request })
    }

    const userRow = await userRepository.selectRowByIdForShare(trx, subscriptionRow.user_id)

    if (userRow === undefined) {
      throw new UserNotFoundError({ request }, 100)
    }

    // ...

    const updatedSubscriptionRow = await subscriptionRepository.updateRowStatus(
      trx,
      subscriptionRow.id,
      'cancel'
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
 * List Subscriptions
 */
export const listSubscriptions: ListSubscriptions = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const userRow = await userRepository.selectRowByIdForShare(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError({ request })
    }

    const subscriptionRows = await subscriptionRepository.selectRowsList(
      trx,
      request.userId,
      request.all ?? false
    )

    return {
      subscriptions: subscriptionRepository.buildCollection(subscriptionRows)
    }
  })
}

/**
 * Produce Subscriptions
 */
export const produceSubscriptions: ProduceSubscriptions = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const subscriptions: Subscription[] = []

    const subscriptionRows = await subscriptionRepository.selectRowsProduce(trx, request.limit)

    for (const subscriptionRow of subscriptionRows) {
      const updatedSubscriptionRow = await subscriptionRepository.updateRowProduce(
        trx,
        subscriptionRow.id
      )

      subscriptions.push(subscriptionRepository.buildModel(updatedSubscriptionRow))
    }

    return { subscriptions }
  })
}

/**
 * Consume Subscription
 */
export const consumeSubscription: ConsumeSubscription = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []
    let isChanged = false

    const subscriptionRow = await subscriptionRepository.selectRowByIdForUpdate(
      trx,
      request.subscriptionId
    )

    if (subscriptionRow === undefined) {
      throw new SubscriptionNotFoundError({ request })
    }

    const userRow = await userRepository.selectRowByIdForShare(trx, subscriptionRow.user_id)

    if (userRow === undefined) {
      throw new UserNotFoundError({ request }, 100)
    }

    const planRow = await planRepository.selectRowByIdForShare(trx, subscriptionRow.plan_id)

    if (planRow === undefined) {
      throw new PlanNotFoundError({ request }, 100)
    }

    if (subscriptionRow.status === 'wait') {
      if (subscriptionRow.queued_at > subscriptionRow.created_at + 900 * 1000) {
        isChanged = true

        subscriptionRow.status = 'cancel'
      }
    }

    if (subscriptionRow.status === 'active') {
      const duration = subscriptionRow.duration_days * 3600 * 24 * 1000
      if (subscriptionRow.queued_at > subscriptionRow.created_at + duration) {
        isChanged = true

        subscriptionRow.status = 'finish'
      }
    }

    // ...

    if (!isChanged) {
      return {
        subscription: subscriptionRepository.buildModel(subscriptionRow),
        backLog
      }
    }

    const updatedSubscriptionRow = await subscriptionRepository.updateRowConsume(
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
