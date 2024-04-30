import { Notify } from '@avito-speculant/common'
import { Bot } from '../bot.js'
import { BotLogData } from '../../bot-log/bot-log.js'
import { DatabaseMethod } from '../../database.js'

export type EnableBotRequest = {
  userId: number
  botId: number
  data: BotLogData
}

export type EnableBotResponse = {
  bot: Bot
  backLog: Notify[]
}

export type EnableBot = DatabaseMethod<EnableBotRequest, EnableBotResponse>
