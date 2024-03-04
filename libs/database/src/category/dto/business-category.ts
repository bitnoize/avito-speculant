import { Category } from '../category.js'
import { CategoryLogData } from '../../category-log/category-log.js'
import { Notify } from '../../database.js'

export interface BusinessCategoryRequest {
  categoryId: number
  data: CategoryLogData
}

export interface BusinessCategoryResponse {
  message: string
  statusCode: number
  category: Category
  backLog: Notify[]
}
