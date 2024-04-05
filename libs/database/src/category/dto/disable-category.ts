import { Notify } from '@avito-speculant/common'
import { Category } from '../category.js'
import { CategoryLogData } from '../../category-log/category-log.js'
import { DatabaseMethod } from '../../database.js'

export type DisableCategoryRequest = {
  categoryId: number
  data: CategoryLogData
}

export type DisableCategoryResponse = {
  category: Category
  backLog: Notify[]
}

export type DisableCategory = DatabaseMethod<DisableCategoryRequest, DisableCategoryResponse>

