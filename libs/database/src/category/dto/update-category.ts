import { Notify, Category, CategoryLogData } from '@avito-speculant/domain'

export interface UpdateCategoryRequest {
  id: number
  userId: number
  avitoUrl?: string
  data: CategoryLogData
}

export interface UpdateCategoryResponse {
  message: string
  statusCode: number
  category: Category
  backLog: Notify[]
}
