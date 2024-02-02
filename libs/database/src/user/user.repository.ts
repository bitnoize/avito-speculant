import { Kysely } from 'kysely'
import { UserRow, InsertableUserRow, UpdateableUserRow } from './user.table.js'
import { Database } from '../database.js'

export async function upsertUser(
  db: Kysely<Database>,
  user: InsertableUserRow
): Promise<UserRow> {
  const insertedUser = await db
    .insertInto('user')
    .values(user)
    .onConflict((oc) =>
      oc.column('tg_from_id').doUpdateSet({
        first_name: (eb) => eb.ref('excluded.first_name'),
        last_name: (eb) => eb.ref('excluded.last_name'),
        username: (eb) => eb.ref('excluded.username'),
        language_code: (eb) => eb.ref('excluded.language_code'),
        updated_at: (eb) => eb.ref('excluded.updated_at')
      })
    )
    .returningAll()
    .executeTakeFirstOrThrow()

  return insertedUser
}
