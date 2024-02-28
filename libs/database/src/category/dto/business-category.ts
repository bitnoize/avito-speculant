import {
  Notify,
  User,
  Subscription,
  Category,
  CategoryLogData
} from '@avito-speculant/domain'

export interface BusinessCategoryRequest {
  categoryId: number
  data: CategoryLogData
}

export interface BusinessCategoryResponse {
  message: string
  statusCode: number
  category: Category
  user: User
  subscription?: Subscription
  backLog: Notify[]
}
