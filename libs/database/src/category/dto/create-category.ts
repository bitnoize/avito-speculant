import {
  Notify,
  Category,
  CategoryLog,
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
  category: Category
  backLog: Notify[]
}
