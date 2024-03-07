import { Generated, ColumnType, Selectable, Insertable } from 'kysely'
import { SubscriptionLogData } from './subscription-log.js'
import { SubscriptionStatus } from '../subscription/subscription.js'

export interface SubscriptionLogTable {
  id: Generated<string>
  subscription_id: ColumnType<number, number, never>
  action: ColumnType<string, string, never>
  status: ColumnType<SubscriptionStatus, SubscriptionStatus, never>
  data: ColumnType<SubscriptionLogData, SubscriptionLogData, never>
  created_at: ColumnType<number, number, never>
}

export type SubscriptionLogRow = Selectable<SubscriptionLogTable>
export type InsertableSubscriptionLogRow = Insertable<SubscriptionLogTable>
