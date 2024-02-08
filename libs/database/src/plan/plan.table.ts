import { Generated, ColumnType, Selectable, Insertable, Updateable } from 'kysely'

export interface PlanTable {
  id: Generated<number>
  sort_order: number
  categories_max: number
  price_rub: number
  duration_days: number
  interval_sec: number
  analytics_on: boolean
  is_enabled: boolean
  subscriptions: ColumnType<number, never, never>
  created_at: ColumnType<number, never, never>
  updated_at: ColumnType<number, never, never>
  scheduled_at: ColumnType<number, never, never>
}

export type PlanRow = Selectable<PlanTable>
export type InsertablePlanRow = Insertable<PlanTable>
export type UpdateablePlanRow = Updateable<PlanTable>
