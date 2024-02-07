import { UserRow } from './user/user.table.js'
import { UserLogRow } from './user-log/user-log.table.js'
import { Subscription } from './subscription/subscription.js'
import { SubscriptionRow } from './subscription/subscription.table.js'
import { SubscriptionLog } from './subscription-log/subscription-log.js'
import { SubscriptionLogRow } from './subscription-log/subscription-log.table.js'

export const makeSubscriptionLogFromRow = (
  row: SubscriptionLogRow
): SubscriptionLog => {
  return {
    id: row.id,
    subscriptionId: row.subscription_id,
    time: row.time,
    action: row.action,
    categoriesMax: row.categories_max,
    priceRub: row.price_rub,
    durationDays: row.duration_days,
    intervalSec: row.interval_sec,
    analyticsOn: row.analytics_on,
    status: row.status,
    data: row.data
  }
}

export const makeSubscriptionLogsFromRows = (
  rows: SubscriptionLogRow[]
): SubscriptionLog[] => {
  return rows.map((row) => makeSubscriptionLogFromRow(row))
}
