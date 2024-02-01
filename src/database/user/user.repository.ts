import { Kysely, Transaction } from 'kysely'
import { UserRow, InsertableUserRow, UpdateableUserRow } from './user.table.js'
import { Database } from '../database.js'

/*
export async function insertUser(
  db: Database,
  user: InsertableUserRow
): Promise<UserRow> {

}
*/
