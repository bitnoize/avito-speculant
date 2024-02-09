import { Kysely } from 'kysely'
// Category
import { CategoryNotFoundError } from '../category/category.errors.js'
import * as categoryRepository from '../category/category.repository.js'
// CategoryLog
import {
  ListCategoryLogsRequest,
  ListCategoryLogsResponse
} from './category-log.js'
import * as categoryLogRepository from './category-log.repository.js'
// Common
import { Database } from '../database.js'

export async function listCategoryLogs(
  db: Kysely<Database>,
  request: ListCategoryLogsRequest
): Promise<ListCategoryLogsResponse> {
  return await db.transaction().execute(async (trx) => {
    const categoryRow = await categoryRepository.selectRowByIdForShare(
      trx,
      request.categoryId
    )

    if (categoryRow === undefined) {
      throw new CategoryNotFoundError(request, 400)
    }

    const categoryLogRows = await categoryLogRepository.selectRowsByCategoryId(
      trx,
      categoryRow.id,
      request.limit
    )

    return {
      message: `CategoryLogs listed successfully`,
      statusCode: 200,
      categoryLogs: categoryLogRepository.buildCollection(categoryLogRows),
      limit: request.limit
    }
  })
}
