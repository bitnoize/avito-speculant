import { ListCategoryLogsRequest, ListCategoryLogsResponse } from './dto/list-category-logs.js'
import * as categoryLogRepository from './category-log.repository.js'
import { CategoryNotFoundError } from '../category/category.errors.js'
import * as categoryRepository from '../category/category.repository.js'
import { KyselyDatabase } from '../database.js'

/*
 * List CategoryLogs
 */
export async function listCategoryLogs(
  db: KyselyDatabase,
  request: ListCategoryLogsRequest
): Promise<ListCategoryLogsResponse> {
  return await db.transaction().execute(async (trx) => {
    const categoryRow = await categoryRepository.selectRowByIdForShare(trx, request.categoryId)

    if (categoryRow === undefined) {
      throw new CategoryNotFoundError(request)
    }

    const categoryLogRows = await categoryLogRepository.selectRowsList(
      trx,
      categoryRow.id,
      request.limit
    )

    return {
      categoryLogs: categoryLogRepository.buildCollection(categoryLogRows)
    }
  })
}
