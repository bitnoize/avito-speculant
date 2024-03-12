import { Category } from '../category.js'

export interface QueueCategoriesRequest {
  limit?: number
}

export interface QueueCategoriesResponse {
  categories: Category[]
  limit: number
}
