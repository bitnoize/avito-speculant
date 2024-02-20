import { Notify, Category, CategoryLogData } from '@avito-speculant/domain'

export interface EnableDisableCategoryRequest {
  categoryId: number
  userId: number
  data: CategoryLogData
}

export interface EnableDisableCategoryResponse {
  message: string
  statusCode: number
  category: Category
  backLog: Notify[]
}
