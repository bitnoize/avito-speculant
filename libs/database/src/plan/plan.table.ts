import { Generated, ColumnType, Selectable, Insertable, Updateable } from 'kysely'

export interface PlanTable {
  id: Generated<number>
  categories_max: ColumnType<number, number, never>
  duration_days: ColumnType<number, number, never>
  interval_sec: ColumnType<number, number, never>
  analytics_on: ColumnType<boolean, boolean, never>
  price_rub: ColumnType<number, number, number | undefined>
  is_enabled: ColumnType<boolean, boolean, boolean | undefined>
  subscriptions: ColumnType<number, number, number | undefined>
  created_at: ColumnType<number, number, never>
  updated_at: ColumnType<number, number, number | undefined>
  queued_at: ColumnType<number, number, number | undefined>
}

export type PlanRow = Selectable<PlanTable>
export type InsertablePlanRow = Insertable<PlanTable>
export type UpdateablePlanRow = Updateable<PlanTable>
