import { Bot } from '../bot.js'
import { DatabaseMethod } from '../../database.js'

export type ListBotsRequest = {
  userId: number
}

export type ListBotsResponse = {
  bots: Bot[]
}

export type ListBots = DatabaseMethod<ListBotsRequest, ListBotsResponse>
