import { Kysely, Transaction } from 'kysely'
import { UserRow, InsertableUserRow, UpdateableUserRow } from './user.table.js'
import { InsertableUserLogRow } from '../user-log/user-log.table.js'
import * as userLogRepository from '../user-log/user-log.repository.js'
import { Database } from '../database.js'

export async function selectOrInsertRow(
  db: Kysely<Database>,
  insertableUserRow: InsertableUserRow,
  data: unknown
): Promise<UserRow> {
  return await db.transaction().execute(async (trx) => {
    const selectedUserRow = await selectRowByTgFromIdForShare(
      trx,
      insertableUserRow.tg_from_id
    )

    if (selectedUserRow !== undefined) {
      return selectedUserRow
    }

    const insertedUserRow = await trx
      .insertInto('user')
      .values(insertableUserRow)
      .returningAll()
      .executeTakeFirstOrThrow()

    const insertableUserLogRow: InsertableUserLogRow = {
      user_id: insertedUserRow.id,
      action: 'register_user',
      status: insertedUserRow.status,
      data
    }

    await userLogRepository.insert(trx, insertableUserLogRow)

    return insertedUserRow
  })
}

export async function selectRowByTgFromIdForShare(
  trx: Transaction<Database>,
  tg_from_id: string
): Promise<UserRow | undefined> {
  const selectedUserRow = await trx
    .selectFrom('user')
    .selectAll()
    .where('tg_from_id', '=', tg_from_id)
    .forShare()
    .executeTakeFirst()

  return selectedUserRow
}
