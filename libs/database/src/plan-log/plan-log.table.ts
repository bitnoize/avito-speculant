import { Generated, ColumnType, Selectable, Insertable } from 'kysely'
import { PlanLogData } from '@avito-speculant/domain'

export interface PlanLogTable {
  id: Generated<string>
  plan_id: ColumnType<number, number, never>
  action: ColumnType<string, string, never>
  categories_max: ColumnType<number, number, never>
  price_rub: ColumnType<number, number, never>
  duration_days: ColumnType<number, number, never>
  interval_sec: ColumnType<number, number, never>
  analytics_on: ColumnType<boolean, boolean, never>
  is_enabled: ColumnType<boolean, boolean, never>
  subscriptions: ColumnType<number, number, never>
  data: ColumnType<PlanLogData, PlanLogData, never>
  created_at: ColumnType<number, string, never>
}

export type PlanLogRow = Selectable<PlanLogTable>
export type InsertablePlanLogRow = Insertable<PlanLogTable>
