import { User, Subscription, Category } from '@avito-speculant/domain'

export interface ListCategoriesRequest {
  userId: number
  all: boolean
}

export interface ListCategoriesResponse {
  message: string
  statusCode: number
  user: User
  subscription?: Subscription
  categories: Category[]
  all: boolean
}
