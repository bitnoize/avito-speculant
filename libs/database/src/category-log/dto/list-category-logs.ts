import { CategoryLog } from '../category-log.js'
import { DatabaseMethod } from '../../database.js'

export type ListCategoryLogsRequest = {
  categoryId: number
  limit: number
}

export type ListCategoryLogsResponse = {
  categoryLogs: CategoryLog[]
}

export type ListCategoryLogs = DatabaseMethod<ListCategoryLogsRequest, ListCategoryLogsResponse>
