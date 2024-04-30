import { BotLog } from '../bot-log.js'
import { DatabaseMethod } from '../../database.js'

export type ListBotLogsRequest = {
  botId: number
  limit: number
}

export type ListBotLogsResponse = {
  botLogs: BotLog[]
}

export type ListBotLogs = DatabaseMethod<ListBotLogsRequest, ListBotLogsResponse>
