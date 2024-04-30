import { ListCategoryLogs } from './dto/list-category-logs.js'
import * as categoryLogRepository from './category-log.repository.js'
import { CategoryNotFoundError } from '../category/category.errors.js'
import * as categoryRepository from '../category/category.repository.js'

/*
 * List CategoryLogs
 */
export const listCategoryLogs: ListCategoryLogs = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const categoryRow = await categoryRepository.selectRowById(trx, request.categoryId)

    if (categoryRow === undefined) {
      throw new CategoryNotFoundError({ request })
    }

    const categoryLogRows = await categoryLogRepository.selectRowsByCategoryId(
      trx,
      categoryRow.id,
      request.limit
    )

    return {
      categoryLogs: categoryLogRepository.buildCollection(categoryLogRows)
    }
  })
}
