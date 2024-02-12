import { CategoryLog } from '@avito-speculant/domain'

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
