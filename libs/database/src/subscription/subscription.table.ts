import { Generated, ColumnType, Selectable, Insertable, Updateable } from 'kysely'
import { SubscriptionStatus } from './subscription.js'

export interface SubscriptionTable {
  id: Generated<number>
  user_id: ColumnType<number, number, never>
  plan_id: ColumnType<number, number, never>
  price_rub: ColumnType<number, number, never>
  status: ColumnType<SubscriptionStatus, SubscriptionStatus, SubscriptionStatus | undefined>
  created_at: ColumnType<number, number, never>
  updated_at: ColumnType<number, number, number | undefined>
  queued_at: ColumnType<number, number, number | undefined>
  timeout_at: ColumnType<number, number, never>
  finish_at: ColumnType<number, number, never>
}

export type SubscriptionRow = Selectable<SubscriptionTable>
export type InsertableSubscriptionRow = Insertable<SubscriptionTable>
export type UpdateableSubscriptionRow = Updateable<SubscriptionTable>
