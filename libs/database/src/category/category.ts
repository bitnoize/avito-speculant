export const DEFAULT_CATEGORY_LIST_ALL = false
export const DEFAULT_CATEGORY_QUEUE_LIMIT = 100

export interface Category {
  id: number
  userId: number
  avitoUrl: string
  isEnabled: boolean
  createdAt: number
  updatedAt: number
  queuedAt: number
}
