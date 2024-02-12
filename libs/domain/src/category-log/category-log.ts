export type CategoryLogData = Record<string, unknown>

export interface CategoryLog {
  id: string
  categoryId: number
  action: string
  avitoUrl: string
  isEnabled: boolean
  data: CategoryLogData
  createdAt: number
}
