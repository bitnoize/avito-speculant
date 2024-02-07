import { Kysely } from 'kysely'
// User
import { UserNotFoundError, UserBlockError } from '../user/user.errors.js'
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
import * as subscriptionLogRepository
  from '../subscription-log/subscription-log.repository.js'
// Common
import { Database } from '../database.js'

export async function createSubscription(
  db: Kysely<Database>,
  request: CreateSubscriptionRequest
): Promise<CreateSubscriptionResponse> {
  return await db.transaction().execute(async (trx) => {
    const userRow = await userRepository.selectRowByIdForShare(
      trx,
      request.userId
    )

    if (userRow === undefined) {
      throw new UserNotFoundError(request, `createSubscription: user not found`, 400)
    }

    if (userRow.status === 'block') {
      throw new UserBlockError(request, `createSubscription: user blocked`, 403)
    }

    const planRow = await planRepository.selectRowByIdForShare(
      trx,
      request.planId
    )

    if (planRow === undefined) {
      throw new PlanNotFoundError(request, `createSubscription: plan not found`, 400)
    }

    if (!planRow.is_enabled) {
      throw new PlanDisabledError(request, `createSubscription: plan disabled`, 403)
    }

    const selectedSubscriptionRow = await subscriptionRepository
      .selectRowByUserIdStatusWaitForShare(
        trx,
        userRow.id
      )

    if (selectedSubscriptionRow !== undefined) {
      return {
        message: `createSubscription: subscription allready exists`,
        statusCode: 301,
        user: userRepository.buildModel(userRow),
        plan: planRepository.buildModel(planRow),
        subscription: subscriptionRepository.buildModel(selectedSubscriptionRow)
      }
    }

    // TODO modify plan

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

    await subscriptionLogRepository.insertRow(
      trx,
      {
        subscription_id: insertedSubscriptionRow.id,
        action: 'create_subscription_success',
        categories_max: insertedSubscriptionRow.categories_max,
        price_rub: insertedSubscriptionRow.price_rub,
        duration_days: insertedSubscriptionRow.duration_days,
        interval_sec: insertedSubscriptionRow.interval_sec,
        analytics_on: insertedSubscriptionRow.analytics_on,
        status: insertedSubscriptionRow.status,
        data: request.data
      }
    )

    return {
      message: `createSubscription: subscription successfully created`,
      statusCode: 201,
      user: userRepository.buildModel(userRow),
      plan: planRepository.buildModel(planRow),
      subscription: subscriptionRepository.buildModel(insertedSubscriptionRow)
    }
  })
}
