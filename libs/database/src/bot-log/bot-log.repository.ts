import { sql } from 'kysely'
import { Notify } from '@avito-speculant/common'
import { BotLog, BotLogData } from './bot-log.js'
import { BotLogRow } from './bot-log.table.js'
import { TransactionDatabase } from '../database.js'

export async function selectRowsByBotId(
  trx: TransactionDatabase,
  bot_id: number,
  limit: number
): Promise<BotLogRow[]> {
  return await trx
    .selectFrom('bot_log')
    .selectAll()
    .where('bot_id', '=', bot_id)
    .orderBy('created_at', 'desc')
    .limit(limit)
    .forShare()
    .execute()
}

export async function insertRow(
  trx: TransactionDatabase,
  bot_id: number,
  action: string,
  is_linked: boolean,
  is_enabled: boolean,
  data: BotLogData
): Promise<BotLogRow> {
  return await trx
    .insertInto('bot_log')
    .values(() => ({
      bot_id,
      action,
      is_linked,
      is_enabled,
      data,
      created_at: sql<number>`now()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export const buildModel = (row: BotLogRow): BotLog => {
  return {
    id: row.id,
    botId: row.bot_id,
    action: row.action,
    isLinked: row.is_linked,
    isEnabled: row.is_enabled,
    data: row.data,
    createdAt: row.created_at
  }
}

export const buildCollection = (rows: BotLogRow[]): BotLog[] => {
  return rows.map((row) => buildModel(row))
}

export const buildNotify = (row: BotLogRow): Notify => {
  return ['bot', row.id, row.bot_id, row.action]
}
