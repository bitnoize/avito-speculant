import { Category } from '../category.js'

export interface QueueCategoriesRequest {
  limit?: number
}

export interface QueueCategoriesResponse {
  message: string
  statusCode: number
  categories: Category[]
  limit: number
}
