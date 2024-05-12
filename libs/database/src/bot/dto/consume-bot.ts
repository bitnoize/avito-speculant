import { Notify } from '@avito-speculant/common'
import { Bot } from '../bot.js'
import { BotLogData } from '../../bot-log/bot-log.js'
import { DatabaseMethod } from '../../database.js'

export type ConsumeBotRequest = {
  entityId: number
  data: BotLogData
}

export type ConsumeBotResponse = {
  bot: Bot
  backLog: Notify[]
}

export type ConsumeBot = DatabaseMethod<ConsumeBotRequest, ConsumeBotResponse>
