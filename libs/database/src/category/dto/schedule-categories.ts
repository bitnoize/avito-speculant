import { Notify, Category, CategoryLogData } from '@avito-speculant/domain'

export interface ScheduleCategoriesRequest {
  limit: number
  data: CategoryLogData
}

export interface ScheduleCategoriesResponse {
  message: string
  statusCode: number
  categories: Category[]
  backLog: Notify[]
}
