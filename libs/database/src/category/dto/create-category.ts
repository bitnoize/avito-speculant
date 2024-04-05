import { Notify } from '@avito-speculant/common'
import { Category } from '../category.js'
import { CategoryLogData } from '../../category-log/category-log.js'
import { DatabaseMethod } from '../../database.js'

export type CreateCategoryRequest = {
  userId: number
  avitoUrl: string
  data: CategoryLogData
}

export type CreateCategoryResponse = {
  category: Category
  backLog: Notify[]
}

export type CreateCategory = DatabaseMethod<CreateCategoryRequest, CreateCategoryResponse>

