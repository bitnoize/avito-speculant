import { Notify } from '@avito-speculant/common'
import { Category } from '../category.js'
import { CategoryLogData } from '../../category-log/category-log.js'

export interface EnableDisableCategoryRequest {
  categoryId: number
  data: CategoryLogData
}

export interface EnableDisableCategoryResponse {
  category: Category
  backLog: Notify[]
}
