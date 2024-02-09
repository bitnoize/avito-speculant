import { CategoryData } from '../category/category.js'

export interface CategoryLog {
  id: string
  categoryId: number
  action: string
  avitoUrl: string
  isEnabled: boolean
  data: CategoryData
  createdAt: number
}

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
