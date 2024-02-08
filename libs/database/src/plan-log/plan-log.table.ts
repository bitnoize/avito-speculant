import { Generated, ColumnType, Selectable, Insertable } from 'kysely'
import { PlanData } from '../plan/plan.js'

export interface PlanLogTable {
  id: Generated<string>
  plan_id: ColumnType<number, number, never>
  action: ColumnType<string, string, never>
  data: ColumnType<PlanData, PlanData, never>
  created_at: ColumnType<Date, never, never>
}

export type PlanLogRow = Selectable<PlanLogTable>
export type InsertablePlanLogRow = Insertable<PlanLogTable>
