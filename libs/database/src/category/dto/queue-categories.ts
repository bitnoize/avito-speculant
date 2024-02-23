import { Category } from '@avito-speculant/domain'

export interface QueueCategoriesRequest {
  limit: number
}

export interface QueueCategoriesResponse {
  message: string
  statusCode: number
  categories: Category[]
}
