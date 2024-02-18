import { CategoryNotFoundError } from '@avito-speculant/domain'
import {
  ListCategoryLogsRequest,
  ListCategoryLogsResponse
} from './dto/list-category-logs.js'
import * as categoryRepository from '../category/category.repository.js'
import * as categoryLogRepository from './category-log.repository.js'
import { KyselyDatabase } from '../database.js'

/*
 * List CategoryLogs
 */
export async function listCategoryLogs(
  db: KyselyDatabase,
  request: ListCategoryLogsRequest
): Promise<ListCategoryLogsResponse> {
  return await db.transaction().execute(async (trx) => {
    const categoryRow = await categoryRepository.selectRowByIdForShare(
      trx,
      request.categoryId
    )

    if (categoryRow === undefined) {
      throw new CategoryNotFoundError<ListCategoryLogsRequest>(request)
    }

    const categoryLogRows = await categoryLogRepository.selectRowsList(
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
