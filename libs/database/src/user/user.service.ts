import { Kysely } from 'kysely'
import { AuthorizeUserRequest, AuthorizeUserResponse } from './user.js'
import * as userRepository from './user.repository.js'
import * as userLogRepository from '../user-log/user-log.repository.js'
import { Database } from '../database.js'

export async function authorizeUser(
  db: Kysely<Database>,
  request: AuthorizeUserRequest
): Promise<AuthorizeUserResponse> {
  return await db.transaction().execute(async (trx) => {
    const selectedUserRow = await userRepository.selectRowByTgFromIdForShare(
      trx,
      request.tgFromId
    )

    if (selectedUserRow !== undefined) {
      return {
        user: userRepository.buildModel(selectedUserRow)
      }
    }

    const insertedUserRow = await userRepository.insertRow(
      trx,
      {
        tg_from_id: request.tgFromId
      }
    )

    await userLogRepository.insertRow(
      trx,
      {
        user_id: insertedUserRow.id,
        action: 'authorize_create_user',
        status: insertedUserRow.status,
        subscriptions: insertedUserRow.subscriptions,
        data: request.data
      }
    )

    return {
      user: userRepository.buildModel(insertedUserRow)
    }
  })
}
