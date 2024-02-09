import { Generated, ColumnType, Selectable, Insertable, Updateable } from 'kysely'

export interface PlanTable {
  id: Generated<number>
  categories_max: ColumnType<number, number, number | undefined>
  price_rub: ColumnType<number, number, number | undefined>
  duration_days: ColumnType<number, number, number | undefined>
  interval_sec: ColumnType<number, number, number | undefined>
  analytics_on: ColumnType<boolean, boolean, boolean | undefined>
  is_enabled: ColumnType<boolean, boolean | undefined, undefined>
  subscriptions: ColumnType<number, number | undefined, undefined>
  created_at: ColumnType<number, undefined, never>
  updated_at: ColumnType<number, undefined, undefined>
  scheduled_at: ColumnType<number, undefined, undefined>
}

export type PlanRow = Selectable<PlanTable>
export type InsertablePlanRow = Insertable<PlanTable>
export type UpdateablePlanRow = Updateable<PlanTable>
