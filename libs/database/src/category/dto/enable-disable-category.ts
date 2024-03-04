import { Category } from '../category.js'
import { CategoryLogData } from '../../category-log/category-log.js'
import { Notify } from '../../database.js'

export interface EnableDisableCategoryRequest {
  categoryId: number
  data: CategoryLogData
}

export interface EnableDisableCategoryResponse {
  message: string
  statusCode: number
  category: Category
  backLog: Notify[]
}
