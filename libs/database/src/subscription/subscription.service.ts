import {
  Notify,
  UserNotFoundError,
  UserBlockedError,
  PlanNotFoundError,
  PlanDisabledError
} from '@avito-speculant/domain'
import {
  CreateSubscriptionRequest,
  CreateSubscriptionResponse
} from './dto/create-subscription.js'
import * as userRepository from '../user/user.repository.js'
import * as planRepository from '../plan/plan.repository.js'
import * as subscriptionRepository from './subscription.repository.js'
import * as subscriptionLogRepository from '../subscription-log/subscription-log.repository.js'
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
      throw new UserNotFoundError(request, 400)
    }

    if (userRow.status === 'block') {
      throw new UserBlockedError(request)
    }

    const planRow = await planRepository.selectRowByIdForShare(trx, request.planId)

    if (planRow === undefined) {
      throw new PlanNotFoundError(request, 400)
    }

    if (!planRow.is_enabled) {
      throw new PlanDisabledError(request)
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

    const subscriptionRow = await subscriptionRepository.insertRow(
      trx,
      userRow,
      planRow
    )

    const subscriptionLogRow = await subscriptionLogRepository.insertRow(
      trx,
      'create_plan',
      subscriptionRow,
      request.data
    )

    backLog.push([
      'subscription',
      subscriptionLogRepository.buildNotify(subscriptionLogRow)
    ])

    return {
      message: `Subscription successfully created`,
      statusCode: 201,
      subscription: subscriptionRepository.buildModel(subscriptionRow),
      backLog
    }
  })
}
