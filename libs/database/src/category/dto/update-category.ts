import {
  Notify,
  User,
  Subscription,
  Category,
  CategoryLogData
} from '@avito-speculant/domain'

export interface UpdateCategoryRequest {
  userId: number
  categoryId: number
  avitoUrl?: string
  data: CategoryLogData
}

export interface UpdateCategoryResponse {
  message: string
  statusCode: number
  user: User
  subscription?: Subscription
  category: Category
  backLog: Notify[]
}
