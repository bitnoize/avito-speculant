import { Kysely, Transaction } from 'kysely'
import { UserLogRow, InsertableUserLogRow } from './user-log.table.js'
import { Database } from '../database.js'

export async function selectByUserId(
  db: Kysely<Database>,
  user_id: number
): Promise<UserLogRow[]> {
  const userLogRows = await db
    .selectFrom('user_log')
    .selectAll()
    .where('user_id', '=', user_id)
    .orderBy('time', 'desc')
    .execute()

  return userLogRows
}

export async function insert(
  trx: Transaction<Database>,
  insertableUserLogRow: InsertableUserLogRow
): Promise<void> {
  await trx
    .insertInto('user_log')
    .values(insertableUserLogRow)
    .returningAll()
    .executeTakeFirstOrThrow()
}
