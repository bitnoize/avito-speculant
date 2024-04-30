export interface Bot {
  id: number
  userId: number
  token: string
  isLinked: boolean
  isEnabled: boolean
  createdAt: number
  updatedAt: number
  queuedAt: number
}

export const BOT_PRODUCE_AFTER = '5 minutes'

export const USER_BOTS_LIMIT = 20
