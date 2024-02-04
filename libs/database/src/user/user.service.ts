import { Kysely } from 'kysely'
import { User, AuthorizeUserRequest } from './user.js'
import { UserRow, InsertableUserRow } from './user.table.js'
import * as userRepository from './user.repository.js'
import { Database } from '../database.js'

export async function authorizeUser(
  db: Kysely<Database>,
  request: AuthorizeUserRequest
): Promise<User> {
  const insertableUserRow: InsertableUserRow = {
    tg_from_id: request.tgFromId
  }

  const userRow = await userRepository.selectOrInsertRow(
    db,
    insertableUserRow,
    request.data
  )

  return makeUserFromRow(userRow)
}

const makeUserFromRow = (row: UserRow): User => {
  const user: User = {
    id: row.id,
    tgFromId: row.tg_from_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }

  return user
}

const makeUsersFromRows = (rows: UserRow[]): User[] => {
  return rows.map((row) => makeUserFromRow(row))
}
