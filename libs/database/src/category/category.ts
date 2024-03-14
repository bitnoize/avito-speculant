export const DEFAULT_CATEGORY_LIST_ALL = false
export const DEFAULT_CATEGORY_PRODUCE_LIMIT = 10

export interface Category {
  id: number
  userId: number
  avitoUrl: string
  isEnabled: boolean
  createdAt: number
  updatedAt: number
  queuedAt: number
}
