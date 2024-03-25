import { Notify } from '@avito-speculant/common'
import { Category } from '../category.js'
import { CategoryLogData } from '../../category-log/category-log.js'
import { Subscription } from '../../subscription/subscription.js'

export interface ConsumeCategoryRequest {
  categoryId: number
  data: CategoryLogData
}

export interface ConsumeCategoryResponse {
  category: Category
  subscription?: Subscription
  backLog: Notify[]
}
