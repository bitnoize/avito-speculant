import { Generated, ColumnType, Selectable, Insertable } from 'kysely'
import {
  SubscriptionStatus,
  SubscriptionLogData
} from '@avito-speculant/domain'

export interface SubscriptionLogTable {
  id: Generated<string>
  subscription_id: ColumnType<number, number, never>
  action: ColumnType<string, string, never>
  categories_max: ColumnType<number, number, never>
  price_rub: ColumnType<number, number, never>
  duration_days: ColumnType<number, number, never>
  interval_sec: ColumnType<number, number, never>
  analytics_on: ColumnType<boolean, boolean, never>
  status: ColumnType<SubscriptionStatus, SubscriptionStatus, never>
  data: ColumnType<SubscriptionLogData, SubscriptionLogData, never>
  created_at: ColumnType<number, string, never>
}

export type SubscriptionLogRow = Selectable<SubscriptionLogTable>
export type InsertableSubscriptionLogRow = Insertable<SubscriptionLogTable>
