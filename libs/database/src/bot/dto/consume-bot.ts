import { Notify } from '@avito-speculant/common'
import { Bot } from '../bot.js'
import { BotLogData } from '../../bot-log/bot-log.js'
import { Category } from '../../category/category.js'
import { DatabaseMethod } from '../../database.js'

export type ConsumeBotRequest = {
  botId: number
  data: BotLogData
}

export type ConsumeBotResponse = {
  bot: Bot
  category: Category | undefined
  backLog: Notify[]
}

export type ConsumeBot = DatabaseMethod<ConsumeBotRequest, ConsumeBotResponse>
