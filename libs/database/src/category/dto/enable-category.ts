import { Notify } from '@avito-speculant/common'
import { Category } from '../category.js'
import { CategoryLogData } from '../../category-log/category-log.js'
import { DatabaseMethod } from '../../database.js'

export type EnableCategoryRequest = {
  categoryId: number
  data: CategoryLogData
}

export type EnableCategoryResponse = {
  category: Category
  backLog: Notify[]
}

export type EnableCategory = DatabaseMethod<EnableCategoryRequest, EnableCategoryResponse>

