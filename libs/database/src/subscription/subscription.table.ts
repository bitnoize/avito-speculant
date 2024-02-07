import { Generated, ColumnType, Selectable, Insertable, Updateable } from 'kysely'
import { SubscriptionStatus } from './subscription.js'

export interface SubscriptionTable {
  id: Generated<number>
  user_id: ColumnType<number, number, never>
  plan_id: ColumnType<number, number, never>
  categories_max: ColumnType<number, number, never>
  price_rub: ColumnType<number, number, never>
  duration_days: ColumnType<number, number, never>
  interval_sec: ColumnType<number, number, never>
  analytics_on: ColumnType<boolean, boolean, never>
  status: ColumnType<SubscriptionStatus, never, SubscriptionStatus | undefined>
  create_time: ColumnType<Date, never, never>
  update_time: ColumnType<Date, never, string>
  process_time: ColumnType<Date, never, string | undefined>
}

export type SubscriptionRow = Selectable<SubscriptionTable>
export type InsertableSubscriptionRow = Insertable<SubscriptionTable>
export type UpdateableSubscriptionRow = Updateable<SubscriptionTable>
