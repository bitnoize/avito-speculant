export type CategoryData = Record<string, unknown>

export interface Category {
  id: number
  userId: number
  avitoUrl: string
  isEnabled: boolean
  createdAt: number
  updatedAt: number
  scheduledAt: number
}

export interface CreateCategoryRequest {
  userId: number
  avitoUrl: string
  data: CategoryData
}

export interface CreateCategoryResponse {
  message: string
  statusCode: number
  category: Category
}
