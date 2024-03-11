import { Notify } from '@avito-speculant/notify'
import { Category } from '../category.js'
import { CategoryLogData } from '../../category-log/category-log.js'
import { Subscription } from '../../subscription/subscription.js'

export interface BusinessCategoryRequest {
  categoryId: number
  data: CategoryLogData
}

export interface BusinessCategoryResponse {
  message: string
  category: Category
  subscription?: Subscription
  backLog: Notify[]
}
