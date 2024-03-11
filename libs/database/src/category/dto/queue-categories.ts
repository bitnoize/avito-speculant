import { Category } from '../category.js'

export interface QueueCategoriesRequest {
  limit?: number
}

export interface QueueCategoriesResponse {
  message: string
  categories: Category[]
  limit: number
}
