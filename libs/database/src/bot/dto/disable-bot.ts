import { Notify } from '@avito-speculant/common'
import { Bot } from '../bot.js'
import { BotLogData } from '../../bot-log/bot-log.js'
import { DatabaseMethod } from '../../database.js'

export type DisableBotRequest = {
  userId: number
  botId: number
  data: BotLogData
}

export type DisableBotResponse = {
  bot: Bot
  backLog: Notify[]
}

export type DisableBot = DatabaseMethod<DisableBotRequest, DisableBotResponse>
