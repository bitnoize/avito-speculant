import { Category } from '@avito-speculant/domain'

export interface ListCategoriesRequest {
  userId: number
  all: boolean
}

export interface ListCategoriesResponse {
  message: string
  statusCode: number
  categories: Category[]
  all: boolean
}
