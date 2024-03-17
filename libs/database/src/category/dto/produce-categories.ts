import { Category } from '../category.js'

export interface ProduceCategoriesRequest {
  limit: number
}

export interface ProduceCategoriesResponse {
  categories: Category[]
}
