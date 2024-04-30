import { Generated, ColumnType, Selectable, Insertable } from 'kysely'
import { BotLogData } from './bot-log.js'

export interface BotLogTable {
  id: Generated<string>
  bot_id: ColumnType<number, number, never>
  action: ColumnType<string, string, never>
  is_linked: ColumnType<boolean, boolean, never>
  is_enabled: ColumnType<boolean, boolean, never>
  data: ColumnType<BotLogData, BotLogData, never>
  created_at: ColumnType<number, number, never>
}

export type BotLogRow = Selectable<BotLogTable>
export type InsertableBotLogRow = Insertable<BotLogTable>
