import { Notify } from '@avito-speculant/notify'
import { Category } from '../category.js'
import { CategoryLogData } from '../../category-log/category-log.js'

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
