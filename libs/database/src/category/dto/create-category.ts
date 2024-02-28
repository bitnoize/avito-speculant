import {
  Notify,
  User,
  Subscription,
  Category,
  CategoryLogData
} from '@avito-speculant/domain'

export interface CreateCategoryRequest {
  userId: number
  avitoUrl: string
  data: CategoryLogData
}

export interface CreateCategoryResponse {
  message: string
  statusCode: number
  user: User
  subscription?: Subscription
  category: Category
  backLog: Notify[]
}
