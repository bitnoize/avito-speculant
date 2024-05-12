import { Notify } from '@avito-speculant/common'
import { Category } from '../category.js'
import { CategoryLogData } from '../../category-log/category-log.js'
import { DatabaseMethod } from '../../database.js'

export type ConsumeCategoryRequest = {
  entityId: number
  data: CategoryLogData
}

export type ConsumeCategoryResponse = {
  category: Category
  backLog: Notify[]
}

export type ConsumeCategory = DatabaseMethod<ConsumeCategoryRequest, ConsumeCategoryResponse>
