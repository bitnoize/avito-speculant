import {
  Notify,
  Subscription,
  UserNotFoundError,
  UserBlockedError,
  PlanNotFoundError,
  PlanIsDisabledError,
  SubscriptionNotFoundError,
  SubscriptionExistsError,
  SubscriptionNotWaitError
} from '@avito-speculant/domain'
import {
  CreateSubscriptionRequest,
  CreateSubscriptionResponse
} from './dto/create-subscription.js'
import {
  CancelSubscriptionRequest,
  CancelSubscriptionResponse
} from './dto/cancel-subscription.js'
import {
  ListSubscriptionsRequest,
  ListSubscriptionsResponse
} from './dto/list-subscriptions.js'
import {
  QueueSubscriptionsRequest,
  QueueSubscriptionsResponse
} from './dto/queue-subscriptions.js'
import * as userRepository from '../user/user.repository.js'
import * as planRepository from '../plan/plan.repository.js'
import * as subscriptionRepository from './subscription.repository.js'
import * as subscriptionLogRepository from '../subscription-log/subscription-log.repository.js'
import { KyselyDatabase, TransactionDatabase } from '../database.js'

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

    const existsSubscriptionRow =
      await subscriptionRepository.selectRowByUserIdStatusForShare(
        trx,
        userRow.id,
        'wait'
      )

    if (existsSubscriptionRow !== undefined) {
      throw new SubscriptionExistsError<CreateSubscriptionRequest>(request)
    }

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
      insertedSubscriptionRow.categories_max,
      insertedSubscriptionRow.price_rub,
      insertedSubscriptionRow.duration_days,
      insertedSubscriptionRow.interval_sec,
      insertedSubscriptionRow.analytics_on,
      insertedSubscriptionRow.status,
      request.data
    )

    backLog.push(subscriptionLogRepository.buildNotify(subscriptionLogRow))

    return {
      message: `Subscription successfully created`,
      statusCode: 201,
      subscription: subscriptionRepository.buildModel(insertedSubscriptionRow),
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

    const userRow = await userRepository.selectRowByIdForShare(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError<CancelSubscriptionRequest>(request)
    }

    if (userRow.status === 'block') {
      throw new UserBlockedError<CancelSubscriptionRequest>(request)
    }

    const selectedSubscriptionRow =
      await subscriptionRepository.selectRowByIdUserIdForUpdate(
        trx,
        request.subscriptionId,
        request.userId
      )

    if (selectedSubscriptionRow === undefined) {
      throw new SubscriptionNotFoundError<CancelSubscriptionRequest>(request)
    }

    if (selectedSubscriptionRow.status === 'cancel') {
      return {
        message: `Subscription allready canceled`,
        statusCode: 200,
        subscription: subscriptionRepository.buildModel(selectedSubscriptionRow),
        backLog
      }
    }

    if (selectedSubscriptionRow.status !== 'wait') {
      throw new SubscriptionNotWaitError<CancelSubscriptionRequest>(request)
    }

    const updatedSubscriptionRow = await subscriptionRepository.updateRowStatus(
      trx,
      selectedSubscriptionRow.id,
      'cancel'
    )

    const subscriptionLogRow = await subscriptionLogRepository.insertRow(
      trx,
      updatedSubscriptionRow.id,
      'cancel_wait_subscription',
      updatedSubscriptionRow.categories_max,
      updatedSubscriptionRow.price_rub,
      updatedSubscriptionRow.duration_days,
      updatedSubscriptionRow.interval_sec,
      updatedSubscriptionRow.analytics_on,
      updatedSubscriptionRow.status,
      request.data
    )

    backLog.push(subscriptionLogRepository.buildNotify(subscriptionLogRow))

    return {
      message: `Subscription successfully canceled`,
      statusCode: 201,
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
      request.all
    )

    return {
      message: `Subscriptions successfully listed`,
      statusCode: 200,
      subscriptions: subscriptionRepository.buildCollection(subscriptionRows),
      all: request.all
    }
  })
}

/**
 * Queue Subscriptions
 */
export async function queueSubscriptions(
  trx: TransactionDatabase,
  request: QueueSubscriptionsRequest
): Promise<QueueSubscriptionsResponse> {
  const subscriptions: Subscription[] = []

  const selectedSubscriptionRows =
    await subscriptionRepository.selectRowsSkipLockedForUpdate(trx, request.limit)

  for (const subscriptionRow of selectedSubscriptionRows) {
    const updatedSubscriptionRow = await subscriptionRepository.updateRowQueuedAt(
      trx,
      subscriptionRow.id
    )

    subscriptions.push(subscriptionRepository.buildModel(updatedSubscriptionRow))
  }

  return {
    message: `Subscriptions successfully queued`,
    statusCode: 200,
    subscriptions
  }
}
