import { Generated, ColumnType, Selectable, Insertable } from 'kysely'
import { PlanLogData } from './plan-log.js'

export interface PlanLogTable {
  id: Generated<string>
  plan_id: ColumnType<number, number, never>
  action: ColumnType<string, string, never>
  price_rub: ColumnType<number, number, never>
  is_enabled: ColumnType<boolean, boolean, never>
  subscriptions: ColumnType<number, number, never>
  data: ColumnType<PlanLogData, PlanLogData, never>
  created_at: ColumnType<number, number, never>
}

export type PlanLogRow = Selectable<PlanLogTable>
export type InsertablePlanLogRow = Insertable<PlanLogTable>
