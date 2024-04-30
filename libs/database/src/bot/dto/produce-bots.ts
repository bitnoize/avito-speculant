import { Bot } from '../bot.js'
import { DatabaseMethod } from '../../database.js'

export type ProduceBotsRequest = {
  limit: number
}

export type ProduceBotsResponse = {
  bots: Bot[]
}

export type ProduceBots = DatabaseMethod<ProduceBotsRequest, ProduceBotsResponse>
