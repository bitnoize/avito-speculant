import { Notify } from '@avito-speculant/notify'
import {
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  ActivateSubscriptionRequest,
  ActivateSubscriptionResponse,
  CancelSubscriptionRequest,
  CancelSubscriptionResponse,
  ListSubscriptionsRequest,
  ListSubscriptionsResponse,
  QueueSubscriptionsRequest,
  QueueSubscriptionsResponse,
  BusinessSubscriptionRequest,
  BusinessSubscriptionResponse
} from './dto/index.js'
import {
  DEFAULT_SUBSCRIPTION_LIST_ALL,
  DEFAULT_SUBSCRIPTION_QUEUE_LIMIT,
  Subscription
} from './subscription.js'
import {
  SubscriptionNotFoundError,
  SubscriptionExistsError,
  SubscriptionNotWaitError
} from './subscription.errors.js'
import * as subscriptionRepository from './subscription.repository.js'
import * as subscriptionLogRepository from '../subscription-log/subscription-log.repository.js'
import { UserNotFoundError, UserBlockedError } from '../user/user.errors.js'
import * as userRepository from '../user/user.repository.js'
import * as userLogRepository from '../user-log/user-log.repository.js'
import { PlanNotFoundError, PlanIsDisabledError } from '../plan/plan.errors.js'
import * as planRepository from '../plan/plan.repository.js'
import { KyselyDatabase } from '../database.js'

/**
 * Create Subscription
 */
export async function createSubscription(
  db: KyselyDatabase,
  request: CreateSubscriptionRequest
): Promise<CreateSubscriptionResponse> {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const userRow = await userRepository.selectRowByIdForShare(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError<CreateSubscriptionRequest>(request)
    }

    if (userRow.status === 'block') {
      throw new UserBlockedError<CreateSubscriptionRequest>(request)
    }

    const planRow = await planRepository.selectRowByIdForShare(trx, request.planId)

    if (planRow === undefined) {
      throw new PlanNotFoundError<CreateSubscriptionRequest>(request)
    }

    if (!planRow.is_enabled) {
      throw new PlanIsDisabledError<CreateSubscriptionRequest>(request)
    }

    const waitSubscriptionRow = await subscriptionRepository.selectRowByUserIdStatusForShare(
      trx,
      userRow.id,
      'wait'
    )

    if (waitSubscriptionRow !== undefined) {
      throw new SubscriptionExistsError<CreateSubscriptionRequest>(request)
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
export async function activateSubscription(
  db: KyselyDatabase,
  request: ActivateSubscriptionRequest
): Promise<ActivateSubscriptionResponse> {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const subscriptionRow = await subscriptionRepository.selectRowByIdForUpdate(
      trx,
      request.subscriptionId
    )

    if (subscriptionRow === undefined) {
      throw new SubscriptionNotFoundError<ActivateSubscriptionRequest>(request)
    }

    if (subscriptionRow.status !== 'wait') {
      throw new SubscriptionNotWaitError<ActivateSubscriptionRequest>(request)
    }

    const userRow = await userRepository.selectRowByIdForUpdate(trx, subscriptionRow.user_id)

    if (userRow === undefined) {
      throw new UserNotFoundError<ActivateSubscriptionRequest>(request, 500)
    }

    if (userRow.status === 'block') {
      throw new UserBlockedError<ActivateSubscriptionRequest>(request)
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

    const updatedUserRow = await userRepository.updateRowStatus(trx, userRow.id, 'paid')

    const userLogRow = await userLogRepository.insertRow(
      trx,
      updatedUserRow.id,
      'paid_user',
      updatedUserRow.status,
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
export async function cancelSubscription(
  db: KyselyDatabase,
  request: CancelSubscriptionRequest
): Promise<CancelSubscriptionResponse> {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const subscriptionRow = await subscriptionRepository.selectRowByIdForUpdate(
      trx,
      request.subscriptionId
    )

    if (subscriptionRow === undefined) {
      throw new SubscriptionNotFoundError<CancelSubscriptionRequest>(request)
    }

    if (subscriptionRow.status === 'cancel') {
      return {
        subscription: subscriptionRepository.buildModel(subscriptionRow),
        backLog
      }
    }

    if (subscriptionRow.status !== 'wait') {
      throw new SubscriptionNotWaitError<CancelSubscriptionRequest>(request)
    }

    const userRow = await userRepository.selectRowByIdForShare(trx, subscriptionRow.user_id)

    if (userRow === undefined) {
      throw new UserNotFoundError<CancelSubscriptionRequest>(request, 500)
    }

    if (userRow.status === 'block') {
      throw new UserBlockedError<CancelSubscriptionRequest>(request)
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
      'cancel_wait_subscription',
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
export async function listSubscriptions(
  db: KyselyDatabase,
  request: ListSubscriptionsRequest
): Promise<ListSubscriptionsResponse> {
  return await db.transaction().execute(async (trx) => {
    const userRow = await userRepository.selectRowByIdForShare(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError<ListSubscriptionsRequest>(request)
    }

    if (userRow.status === 'block') {
      throw new UserBlockedError<ListSubscriptionsRequest>(request)
    }

    const subscriptionRows = await subscriptionRepository.selectRowsList(
      trx,
      request.userId,
      (request.all ??= DEFAULT_SUBSCRIPTION_LIST_ALL)
    )

    return {
      subscriptions: subscriptionRepository.buildCollection(subscriptionRows),
      all: request.all
    }
  })
}

/**
 * Queue Subscriptions
 */
export async function queueSubscriptions(
  db: KyselyDatabase,
  request: QueueSubscriptionsRequest
): Promise<QueueSubscriptionsResponse> {
  return await db.transaction().execute(async (trx) => {
    const subscriptions: Subscription[] = []

    const subscriptionRows = await subscriptionRepository.selectRowsSkipLockedForUpdate(
      trx,
      (request.limit ??= DEFAULT_SUBSCRIPTION_QUEUE_LIMIT)
    )

    for (const subscriptionRow of subscriptionRows) {
      const updatedSubscriptionRow = await subscriptionRepository.updateRowQueuedAt(
        trx,
        subscriptionRow.id
      )

      subscriptions.push(subscriptionRepository.buildModel(updatedSubscriptionRow))
    }

    return {
      subscriptions,
      limit: request.limit
    }
  })
}

/**
 * Business Subscription
 */
export async function businessSubscription(
  db: KyselyDatabase,
  request: BusinessSubscriptionRequest
): Promise<BusinessSubscriptionResponse> {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []
    let isChanged = false

    const subscriptionRow = await subscriptionRepository.selectRowByIdForUpdate(
      trx,
      request.subscriptionId
    )

    if (subscriptionRow === undefined) {
      throw new SubscriptionNotFoundError<BusinessSubscriptionRequest>(request)
    }

    const userRow = await userRepository.selectRowByIdForShare(trx, subscriptionRow.user_id)

    if (userRow === undefined) {
      throw new UserNotFoundError<BusinessSubscriptionRequest>(request, 500)
    }

    const planRow = await planRepository.selectRowByIdForShare(trx, subscriptionRow.plan_id)

    if (planRow === undefined) {
      throw new PlanNotFoundError<BusinessSubscriptionRequest>(request, 500)
    }

    if (subscriptionRow.status === 'wait') {
      if (subscriptionRow.created_at < Date.now() - 900 * 1000) {
        isChanged = true

        subscriptionRow.status = 'cancel'
      }
    } else if (subscriptionRow.status === 'active') {
      if (subscriptionRow.created_at < Date.now() - subscriptionRow.duration_days * 86400 * 1000) {
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

    const updatedSubscriptionRow = await subscriptionRepository.updateRowBusiness(
      trx,
      subscriptionRow.id,
      subscriptionRow.status
    )

    const subscriptionLogRow = await subscriptionLogRepository.insertRow(
      trx,
      updatedSubscriptionRow.id,
      'business_subscription',
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
