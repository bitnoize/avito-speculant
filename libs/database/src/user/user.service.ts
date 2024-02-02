import { Kysely } from 'kysely'
import { CreateUserRequest, User } from './user.js'
import { UserRow } from './user.table.js'
import * as userRepository from './user.repository.js'
import { Database } from '../database.js'

export async function createUser(
  db: Kysely<Database>,
  request: CreateUserRequest
): Promise<User> {
  const userRow = await userRepository.upsertUser(db, {
    tg_from_id: request.tgFromId,
    first_name: request.firstName,
    last_name: request.lastName ?? null,
    username: request.username ?? null,
    language_code: request.languageCode ?? null
  })

  const user = userRowToUser(userRow)

  return user
}

export function userRowToUser(userRow: UserRow): User {
  const user: User = {
    id: userRow.id,
    tgFromId: userRow.tg_from_id,
    firstName: userRow.first_name,
    lastName: userRow.last_name,
    username: userRow.username,
    languageCode: userRow.language_code,
    createdAt: userRow.created_at,
    updatedAt: userRow.updated_at
  }

  return user
}
