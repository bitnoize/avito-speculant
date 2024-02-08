import { Kysely } from 'kysely'
import { PgPubSub } from '@imqueue/pg-pubsub'
// User
import { UserNotFoundError, UserBlockedError } from '../user/user.errors.js'
import * as userRepository from '../user/user.repository.js'
// Plan
import { PlanNotFoundError, PlanDisabledError } from '../plan/plan.errors.js'
import * as planRepository from '../plan/plan.repository.js'
// Subscription
import {
  Subscription,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse
} from './subscription.js'
import * as subscriptionRepository from './subscription.repository.js'
// SubscriptionLog
import * as subscriptionLogRepository
  from '../subscription-log/subscription-log.repository.js'
// Database
import { Database } from '../database.js'

export async function createSubscription(
  db: Kysely<Database>,
  pubSub: PgPubSub,
  request: CreateSubscriptionRequest
): Promise<CreateSubscriptionResponse> {
  return await db.transaction().execute(async (trx) => {
    const userRow = await userRepository.selectRowByIdForShare(
      trx,
      request.userId
    )

    if (userRow === undefined) {
      throw new UserNotFoundError(request, 400)
    }

    if (userRow.status === 'block') {
      throw new UserBlockedError(request)
    }

    const planRow = await planRepository.selectRowByIdForShare(
      trx,
      request.planId
    )

    if (planRow === undefined) {
      throw new PlanNotFoundError(request, 400)
    }

    if (!planRow.is_enabled) {
      throw new PlanDisabledError(request)
    }

    const selectedSubscriptionRow = await subscriptionRepository
      .selectRowByUserIdStatusWaitForShare(
        trx,
        userRow.id
      )

    if (selectedSubscriptionRow !== undefined) {
      return {
        message: `Subscription allready exists`,
        statusCode: 200,
        subscription: subscriptionRepository.buildModel(selectedSubscriptionRow)
      }
    }

    // TODO modify plan if needed

    const insertedSubscriptionRow = await subscriptionRepository.insertRow(
      trx,
      {
        user_id: userRow.id,
        plan_id: planRow.id,
        categories_max: planRow.categories_max,
        price_rub: planRow.price_rub,
        duration_days: planRow.duration_days,
        interval_sec: planRow.interval_sec,
        analytics_on: planRow.analytics_on
      }
    )

    const subscriptionLogRow = await subscriptionLogRepository.insertRow(
      trx,
      {
        subscription_id: insertedSubscriptionRow.id,
        action: 'create_subscription',
        categories_max: insertedSubscriptionRow.categories_max,
        price_rub: insertedSubscriptionRow.price_rub,
        duration_days: insertedSubscriptionRow.duration_days,
        interval_sec: insertedSubscriptionRow.interval_sec,
        analytics_on: insertedSubscriptionRow.analytics_on,
        status: insertedSubscriptionRow.status,
        data: request.data
      }
    )

    await subscriptionLogRepository.notify(pubSub, subscriptionLogRow)

    return {
      message: `Subscription successfully created`,
      statusCode: 201,
      subscription: subscriptionRepository.buildModel(insertedSubscriptionRow)
    }
  })
}
