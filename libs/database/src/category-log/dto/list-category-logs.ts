import { CategoryLog } from '../category-log.js'

export interface ListCategoryLogsRequest {
  categoryId: number
  limit: number
}

export interface ListCategoryLogsResponse {
  message: string
  statusCode: number
  categoryLogs: CategoryLog[]
  limit: number
}
