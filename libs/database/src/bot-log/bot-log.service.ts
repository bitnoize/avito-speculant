import { ListBotLogs } from './dto/index.js'
import { BotNotFoundError } from '../bot/bot.errors.js'
import * as botLogRepository from './bot-log.repository.js'
import * as botRepository from '../bot/bot.repository.js'

/*
 * List BotLogs
 */
export const listBotLogs: ListBotLogs = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const botRow = await botRepository.selectRowById(trx, request.botId)

    if (botRow === undefined) {
      throw new BotNotFoundError({ request })
    }

    const botLogRows = await botLogRepository.selectRowsByBotId(trx, botRow.id, request.limit)

    return {
      botLogs: botLogRepository.buildCollection(botLogRows)
    }
  })
}
