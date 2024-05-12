import { sql } from 'kysely'
import { Bot, BOT_PRODUCE_AFTER } from './bot.js'
import { BotRow } from './bot.table.js'
import { TransactionDatabase } from '../database.js'

export async function selectRowById(
  trx: TransactionDatabase,
  bot_id: number,
  writeLock = false
): Promise<BotRow | undefined> {
  const queryBase = trx.selectFrom('bot').selectAll().where('id', '=', bot_id)

  const queryLock = writeLock ? queryBase.forUpdate() : queryBase.forShare()

  return await queryLock.executeTakeFirst()
}

export async function selectRowByToken(
  trx: TransactionDatabase,
  token: string
): Promise<BotRow | undefined> {
  return await trx
    .selectFrom('bot')
    .selectAll()
    .where('token', '=', token)
    .forShare()
    .executeTakeFirst()
}

export async function selectRowByIdUserId(
  trx: TransactionDatabase,
  bot_id: number,
  user_id: number,
  writeLock = false
): Promise<BotRow | undefined> {
  const queryBase = trx
    .selectFrom('bot')
    .selectAll()
    .where('id', '=', bot_id)
    .where('user_id', '=', user_id)

  const queryLock = writeLock ? queryBase.forUpdate() : queryBase.forShare()

  return await queryLock.executeTakeFirst()
}

export async function selectCountByUserId(
  trx: TransactionDatabase,
  user_id: number
): Promise<number> {
  const { bots } = await trx
    .selectFrom('bot')
    .select((eb) => eb.fn.countAll<number>().as('bots'))
    .where('user_id', '=', user_id)
    .where('is_enabled', 'is', true)
    .executeTakeFirstOrThrow()

  return bots
}

export async function insertRow(
  trx: TransactionDatabase,
  user_id: number,
  token: string
): Promise<BotRow> {
  return await trx
    .insertInto('bot')
    .values(() => ({
      user_id,
      token,
      is_linked: false,
      is_enabled: false,
      created_at: sql<number>`now()`,
      updated_at: sql<number>`now()`,
      queued_at: sql<number>`now()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function updateRowState(
  trx: TransactionDatabase,
  bot_id: number,
  is_linked: boolean,
  is_enabled: boolean
): Promise<BotRow> {
  return await trx
    .updateTable('bot')
    .set(() => ({
      is_linked,
      is_enabled,
      updated_at: sql<number>`now()`
    }))
    .where('id', '=', bot_id)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function selectRowsProduce(
  trx: TransactionDatabase,
  limit: number
): Promise<BotRow[]> {
  return await trx
    .selectFrom('bot')
    .selectAll()
    .where('queued_at', '<', sql<number>`now() - ${BOT_PRODUCE_AFTER}::interval`)
    .orderBy('queued_at', 'asc')
    .forUpdate()
    .skipLocked()
    .limit(limit)
    .execute()
}

export async function updateRowsProduce(
  trx: TransactionDatabase,
  bot_ids: number[]
): Promise<BotRow[]> {
  if (bot_ids.length === 0) {
    return []
  }

  return await trx
    .updateTable('bot')
    .set(() => ({
      queued_at: sql<number>`now()`
    }))
    .where('id', 'in', bot_ids)
    .returningAll()
    .execute()
}

export const buildModel = (row: BotRow): Bot => {
  return {
    id: row.id,
    userId: row.user_id,
    token: row.token,
    isLinked: row.is_linked,
    isEnabled: row.is_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    queuedAt: row.queued_at
  }
}

export const buildCollection = (rows: BotRow[]): Bot[] => {
  return rows.map((row) => buildModel(row))
}
