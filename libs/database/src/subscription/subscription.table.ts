import { Generated, ColumnType, Selectable, Insertable, Updateable } from 'kysely'
import { SubscriptionStatus } from '@avito-speculant/domain'

export interface SubscriptionTable {
  id: Generated<number>
  user_id: ColumnType<number, number, never>
  plan_id: ColumnType<number, number, never>
  categories_max: ColumnType<number, number, never>
  price_rub: ColumnType<number, number, never>
  duration_days: ColumnType<number, number, never>
  interval_sec: ColumnType<number, number, never>
  analytics_on: ColumnType<boolean, boolean, never>
  status: ColumnType<SubscriptionStatus, never, never>
  created_at: ColumnType<number, never, never>
  updated_at: ColumnType<number, never, never>
  scheduled_at: ColumnType<number, never, never>
}

export type SubscriptionRow = Selectable<SubscriptionTable>
export type InsertableSubscriptionRow = Insertable<SubscriptionTable>
export type UpdateableSubscriptionRow = Updateable<SubscriptionTable>
