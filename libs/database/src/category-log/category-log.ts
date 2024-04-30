export type CategoryLogData = Record<string, unknown>

export interface CategoryLog {
  id: string
  categoryId: number
  action: string
  botId: number | null
  isEnabled: boolean
  data: CategoryLogData
  createdAt: number
}
