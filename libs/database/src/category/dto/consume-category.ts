import { Notify } from '@avito-speculant/common'
import { Category } from '../category.js'
import { CategoryLogData } from '../../category-log/category-log.js'
import { Subscription } from '../../subscription/subscription.js'
import { DatabaseMethod } from '../../database.js'

export type ConsumeCategoryRequest = {
  categoryId: number
  data: CategoryLogData
}

export type ConsumeCategoryResponse = {
  category: Category
  subscription?: Subscription
  backLog: Notify[]
}

export type ConsumeCategory = DatabaseMethod<ConsumeCategoryRequest, ConsumeCategoryResponse>
