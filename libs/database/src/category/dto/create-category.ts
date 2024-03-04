import { Category } from '../category.js'
import { CategoryLogData } from '../../category-log/category-log.js'
import { Notify } from '../../database.js'

export interface CreateCategoryRequest {
  userId: number
  avitoUrl: string
  data: CategoryLogData
}

export interface CreateCategoryResponse {
  message: string
  statusCode: number
  category: Category
  backLog: Notify[]
}
