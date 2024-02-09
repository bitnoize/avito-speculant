import { Kysely } from 'kysely'
import { PgPubSub } from '@imqueue/pg-pubsub'
// User
import {
  UserNotFoundError,
  UserNotPaidError,
  UserBlockedError
} from '../user/user.errors.js'
import * as userRepository from '../user/user.repository.js'
// Category
import { CreateCategoryRequest, CreateCategoryResponse } from './category.js'
import * as categoryRepository from './category.repository.js'
// CategoryLog
import * as categoryLogRepository from '../category-log/category-log.repository.js'
// Database
import { Database } from '../database.js'

export async function createCategory(
  db: Kysely<Database>,
  pubSub: PgPubSub,
  request: CreateCategoryRequest
): Promise<CreateCategoryResponse> {
  return await db.transaction().execute(async (trx) => {
    const userRow = await userRepository.selectRowByIdForShare(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError(request, 400)
    }

    if (userRow.status !== 'paid') {
      throw new UserNotPaidError(request)
    }

    const insertedCategoryRow = await categoryRepository.insertRow(trx, {
      user_id: userRow.id,
      avito_url: request.avitoUrl
    })

    const categoryLogRow = await categoryLogRepository.insertRow(trx, {
      category_id: insertedCategoryRow.id,
      action: 'create_category',
      avito_url: insertedCategoryRow.avito_url,
      is_enabled: insertedCategoryRow.is_enabled,
      data: request.data
    })

    //await categoryLogRepository.notify(pubSub, categoryLogRow)

    return {
      message: `Category successfully created`,
      statusCode: 201,
      category: categoryRepository.buildModel(insertedCategoryRow)
    }
  })
}
