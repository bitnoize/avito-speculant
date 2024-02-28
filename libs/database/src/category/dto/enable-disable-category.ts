import {
  Notify,
  User,
  Subscription,
  Category,
  CategoryLogData
} from '@avito-speculant/domain'

export interface EnableDisableCategoryRequest {
  userId: number
  categoryId: number
  data: CategoryLogData
}

export interface EnableDisableCategoryResponse {
  message: string
  statusCode: number
  user: User
  subscription?: Subscription
  category: Category
  backLog: Notify[]
}
