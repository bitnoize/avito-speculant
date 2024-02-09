import { Kysely } from 'kysely'
import { PgPubSub } from '@imqueue/pg-pubsub'
// User
import { AuthorizeUserRequest, AuthorizeUserResponse } from './user.js'
import * as userRepository from './user.repository.js'
// UserLog
import * as userLogRepository from '../user-log/user-log.repository.js'
// Database
import { Database } from '../database.js'

export async function authorizeUser(
  db: Kysely<Database>,
  pubSub: PgPubSub,
  request: AuthorizeUserRequest
): Promise<AuthorizeUserResponse> {
  return await db.transaction().execute(async (trx) => {
    const selectedUserRow = await userRepository.selectRowByTgFromIdForShare(
      trx,
      request.tgFromId
    )

    if (selectedUserRow !== undefined) {
      return {
        message: `User allready exists`,
        statusCode: 200,
        user: userRepository.buildModel(selectedUserRow)
      }
    }

    const insertedUserRow = await userRepository.insertRow(trx, {
      tg_from_id: request.tgFromId
    })

    const userLogRow = await userLogRepository.insertRow(trx, {
      user_id: insertedUserRow.id,
      action: 'authorize_user',
      status: insertedUserRow.status,
      subscriptions: insertedUserRow.subscriptions,
      data: request.data
    })

    //await userLogRepository.notify(pubSub, userLogRow)

    return {
      message: `Authorize user successfully created`,
      statusCode: 201,
      user: userRepository.buildModel(insertedUserRow)
    }
  })
}
