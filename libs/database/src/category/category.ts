export interface Category {
  id: number
  userId: number
  urlPath: string
  botId: number | null
  isEnabled: boolean
  createdAt: number
  updatedAt: number
  queuedAt: number
}

export const CATEGORY_PRODUCE_AFTER = '1 minute'
