import { Kysely } from 'kysely'
// User
import {
  Notify,
  UserNotFoundError,
  UserBlockedError
} from '@avito-speculant/domain'
import {
  CreateCategoryRequest,
  CreateCategoryResponse
} from './dto/create-category.js'
import * as userRepository from '../user/user.repository.js'
import * as categoryRepository from './category.repository.js'
import * as categoryLogRepository from '../category-log/category-log.repository.js'
import { Database } from '../database.js'

/**
 * Create Category
 */
export async function createCategory(
  db: Kysely<Database>,
  request: CreateCategoryRequest
): Promise<CreateCategoryResponse> {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const userRow = await userRepository.selectRowByIdForShare(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError(request, 400)
    }

    if (userRow.status === 'block') {
      throw new UserBlockedError(request)
    }

    const categoryRow = await categoryRepository.insertRow(
      trx,
      userRow,
      request.avitoUrl
    )

    const categoryLogRow = await categoryLogRepository.insertRow(
      trx,
      'create_category',
      categoryRow,
      request.data
    )

    backLog.push([
      'category',
      categoryLogRepository.buildNotify(categoryLogRow)
    ])

    return {
      message: `Category successfully created`,
      statusCode: 201,
      category: categoryRepository.buildModel(categoryRow),
      backLog
    }
  })
}
