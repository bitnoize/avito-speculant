import { Generated, ColumnType, Selectable, Insertable, Updateable } from 'kysely'

export interface BotTable {
  id: Generated<number>
  user_id: ColumnType<number, number, never>
  token: ColumnType<string, string, never>
  is_linked: ColumnType<boolean, boolean, boolean | undefined>
  is_enabled: ColumnType<boolean, boolean, boolean | undefined>
  created_at: ColumnType<number, number, never>
  updated_at: ColumnType<number, number, number | undefined>
  queued_at: ColumnType<number, number, number | undefined>
}

export type BotRow = Selectable<BotTable>
export type InsertableBotRow = Insertable<BotTable>
export type UpdateableBotRow = Updateable<BotTable>
