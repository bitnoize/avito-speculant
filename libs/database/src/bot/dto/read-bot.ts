import { Bot } from '../bot.js'
import { Category } from '../../category/category.js'
import { DatabaseMethod } from '../../database.js'

export type ReadBotRequest = {
  userId: number
  botId: number
}

export type ReadBotResponse = {
  bot: Bot
  category: Category | undefined
}

export type ReadBot = DatabaseMethod<ReadBotRequest, ReadBotResponse>
