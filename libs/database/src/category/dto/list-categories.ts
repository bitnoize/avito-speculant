import { Category } from '../category.js'

export interface ListCategoriesRequest {
  userId: number
  all: boolean
}

export interface ListCategoriesResponse {
  message: string
  statusCode: number
  categories: Category[]
  all: boolean
}
