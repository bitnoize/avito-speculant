import { CategoryLog } from '../category-log.js'

export interface ListCategoryLogsRequest {
  categoryId: number
  limit: number
}

export interface ListCategoryLogsResponse {
  categoryLogs: CategoryLog[]
}
