import { Kysely } from 'kysely'
import { Notify } from '@avito-speculant/domain'
import {
  AuthorizeUserRequest,
  AuthorizeUserResponse
} from './dto/authorize-user.js'
import * as userRepository from './user.repository.js'
import * as userLogRepository from '../user-log/user-log.repository.js'
import { Database } from '../database.js'

/**
 * Authorize User
 */
export async function authorizeUser(
  db: Kysely<Database>,
  request: AuthorizeUserRequest
): Promise<AuthorizeUserResponse> {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const existsUserRow = await userRepository.selectRowByTgFromIdForShare(
      trx,
      request.tgFromId
    )

    if (existsUserRow !== undefined) {
      return {
        message: `User allready exists`,
        statusCode: 200,
        user: userRepository.buildModel(existsUserRow),
        backLog
      }
    }

    const userRow = await userRepository.insertRow(
      trx,
      request.tgFromId
    )

    const userLogRow = await userLogRepository.insertRow(
      trx,
      'authorize_user',
      userRow,
      request.data
    )

    backLog.push([
      'user',
      userLogRepository.buildNotify(userLogRow)
    ])

    return {
      message: `User successfully created`,
      statusCode: 201,
      user: userRepository.buildModel(userRow),
      backLog
    }
  })
}
