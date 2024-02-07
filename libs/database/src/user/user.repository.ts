import { Transaction, sql } from 'kysely'
import { UserRow, InsertableUserRow, UpdateableUserRow } from './user.table.js'
import { User } from './user.js'
import { Database } from '../database.js'

export async function insertRow(
  trx: Transaction<Database>,
  row: InsertableUserRow
): Promise<UserRow> {
  return await trx
    .insertInto('user')
    .values(() => ({
      ...row,
      status: 'blank',
      create_time: sql`NOW()`,
      update_time: sql`NOW()`,
      process_time: sql`NOW()`
    }))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function selectRowByIdForShare(
  trx: Transaction<Database>,
  user_id: number
): Promise<UserRow | undefined> {
  return await trx
    .selectFrom('user')
    .selectAll()
    .where('id', '=', user_id)
    .forShare()
    .executeTakeFirst()
}

export async function selectRowByTgFromIdForShare(
  trx: Transaction<Database>,
  tg_from_id: string
): Promise<UserRow | undefined> {
  return await trx
    .selectFrom('user')
    .selectAll()
    .where('tg_from_id', '=', tg_from_id)
    .forShare()
    .executeTakeFirst()
}

export const buildModel = (row: UserRow): User => {
  return {
    id: row.id,
    tgFromId: row.tg_from_id,
    status: row.status,
    subscriptions: row.subscriptions,
    createTime: row.create_time,
    updateTime: row.update_time,
    processTime: row.process_time
  }
}

export const buildCollection = (rows: UserRow[]): User[] => {
  return rows.map((row) => buildModel(row))
}
