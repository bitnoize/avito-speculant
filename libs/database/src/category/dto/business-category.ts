import { Notify, Category, CategoryLogData } from '@avito-speculant/domain'

export interface BusinessCategoryRequest {
  categoryId: number
  data: CategoryLogData
}

export interface BusinessCategoryResponse {
  message: string
  statusCode: number
  category: Category
  backLog: Notify[]
}
