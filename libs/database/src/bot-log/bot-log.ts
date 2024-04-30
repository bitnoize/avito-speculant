export type BotLogData = Record<string, unknown>

export interface BotLog {
  id: string
  botId: number
  action: string
  isLinked: boolean
  isEnabled: boolean
  data: BotLogData
  createdAt: number
}
