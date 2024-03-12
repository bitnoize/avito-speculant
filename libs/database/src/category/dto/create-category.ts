import { Notify } from '@avito-speculant/notify'
import { Category } from '../category.js'
import { CategoryLogData } from '../../category-log/category-log.js'

export interface CreateCategoryRequest {
  userId: number
  avitoUrl: string
  data: CategoryLogData
}

export interface CreateCategoryResponse {
  category: Category
  backLog: Notify[]
}
