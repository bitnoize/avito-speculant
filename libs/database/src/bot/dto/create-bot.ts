import { Notify } from '@avito-speculant/common'
import { Bot } from '../bot.js'
import { BotLogData } from '../../bot-log/bot-log.js'
import { DatabaseMethod } from '../../database.js'

export type CreateBotRequest = {
  userId: number
  token: string
  data: BotLogData
}

export type CreateBotResponse = {
  bot: Bot
  backLog: Notify[]
}

export type CreateBot = DatabaseMethod<CreateBotRequest, CreateBotResponse>
