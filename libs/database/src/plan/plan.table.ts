import { Generated, ColumnType, Selectable, Insertable, Updateable } from 'kysely'

export interface PlanTable {
  id: Generated<number>
  categories_max: ColumnType<number, number, number | undefined>
  price_rub: ColumnType<number, number, number | undefined>
  duration_days: ColumnType<number, number, number | undefined>
  interval_sec: ColumnType<number, number, number | undefined>
  analytics_on: ColumnType<boolean, boolean, boolean | undefined>
  is_enabled: ColumnType<boolean, boolean, boolean | undefined>
  subscriptions: ColumnType<number, number, number | undefined>
  created_at: ColumnType<number, number, never>
  updated_at: ColumnType<number, number, number | undefined>
  queued_at: ColumnType<number, number, number | undefined>
}

export type PlanRow = Selectable<PlanTable>
export type InsertablePlanRow = Insertable<PlanTable>
export type UpdateablePlanRow = Updateable<PlanTable>
