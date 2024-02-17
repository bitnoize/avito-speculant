import {
  Notify,
  Subscription,
  UserNotFoundError,
  UserBlockedError,
  PlanNotFoundError,
  PlanIsDisabledError
} from '@avito-speculant/domain'
import {
  CreateSubscriptionRequest,
  CreateSubscriptionResponse
} from './dto/create-subscription.js'
import {
  ScheduleSubscriptionsRequest,
  ScheduleSubscriptionsResponse
} from './dto/schedule-subscriptions.js'
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
      await subscriptionRepository.selectRowByUserIdWaitStatusForShare(
        trx,
        userRow.id
      )

    if (existsSubscriptionRow !== undefined) {
      const cancelSubscriptionRow =
        await subscriptionRepository.updateRowCancelStatus(
          trx,
          existsSubscriptionRow.id
        )

      const subscriptionLogRow = await subscriptionLogRepository.insertRow(
        trx,
        'cancel_plan',
        cancelSubscriptionRow,
        request.data
      )

      backLog.push([
        'subscription',
        subscriptionLogRepository.buildNotify(subscriptionLogRow)
      ])
    }

    const insertedSubscriptionRow = await subscriptionRepository.insertRow(
      trx,
      userRow,
      planRow
    )

    const subscriptionLogRow = await subscriptionLogRepository.insertRow(
      trx,
      'create_plan',
      insertedSubscriptionRow,
      request.data
    )

    backLog.push([
      'subscription',
      subscriptionLogRepository.buildNotify(subscriptionLogRow)
    ])

    return {
      message: `Subscription successfully created`,
      statusCode: 201,
      subscription: subscriptionRepository.buildModel(insertedSubscriptionRow),
      backLog
    }
  })
}

/**
 * Schedule Subscriptions
 */
export async function scheduleSubscriptions(
  trx: TransactionDatabase,
  request: ScheduleSubscriptionsRequest
): Promise<ScheduleSubscriptionsResponse> {
  const selectedSubscriptionRows =
    await subscriptionRepository.selectRowsSkipLockedForUpdate(
      trx,
      request.limit
    )

  if (selectedSubscriptionRows.length === 0) {
    return {
      message: `No subscriptions pending to schedule`,
      statusCode: 200,
      subscriptions: [],
      backLog: []
    }
  }

  const subscriptions: Subscription[] = []
  const backLog: Notify[] = []

  for (const subscriptionRow of selectedSubscriptionRows) {
    let isModified = false

    if (subscriptionRow.status === 'wait') {
      if (subscriptionRow.created_at < Date.now() - 900 * 1000) {
        isModified = true

        subscriptionRow.status = 'cancel'
      }
    } else if (subscriptionRow.status === 'active') {
      if (
        subscriptionRow.created_at <
          Date.now() - subscriptionRow.duration_days * 86400 * 1000
      ) {
        isModified = true

        subscriptionRow.status = 'finish'
      }
    }

    const updatedSubscriptionRow = await subscriptionRepository.updateRowSchedule(
      trx,
      subscriptionRow.id,
      subscriptionRow.status
    )

    subscriptions.push(subscriptionRepository.buildModel(subscriptionRow))

    if (isModified) {
      const subscriptionLogRow = await subscriptionLogRepository.insertRow(
        trx,
        'schedule_subscription',
        updatedSubscriptionRow,
        request.data
      )

      backLog.push([
        'subscription',
        subscriptionLogRepository.buildNotify(subscriptionLogRow)
      ])
    }
  }

  return {
    message: `Subscriptions ready to schedule`,
    statusCode: 201,
    subscriptions,
    backLog
  }
}
