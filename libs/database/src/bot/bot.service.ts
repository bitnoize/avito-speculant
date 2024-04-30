import { Notify } from '@avito-speculant/common'
import { CreateBot, EnableBot, DisableBot, ListBots, ProduceBots, ConsumeBot } from './dto/index.js'
import { Bot } from './bot.js'
import { BotNotFoundError, BotExistsError, BotIsLinkedError } from './bot.errors.js'
import * as botRepository from './bot.repository.js'
import * as botLogRepository from '../bot-log/bot-log.repository.js'
import { UserNotFoundError } from '../user/user.errors.js'
import * as userRepository from '../user/user.repository.js'
import { Category } from '../category/category.js'
import * as categoryRepository from '../category/category.repository.js'

/**
 * Create Bot
 */
export const createBot: CreateBot = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const userRow = await userRepository.selectRowById(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError({ request })
    }

    const existsBotRow = await botRepository.selectRowByToken(trx, request.token)

    if (existsBotRow !== undefined) {
      throw new BotExistsError({ request })
    }

    const insertedBotRow = await botRepository.insertRow(trx, request.userId, request.token)

    const botLogRow = await botLogRepository.insertRow(
      trx,
      insertedBotRow.id,
      'create_bot',
      insertedBotRow.is_linked,
      insertedBotRow.is_enabled,
      request.data
    )

    backLog.push(botLogRepository.buildNotify(botLogRow))

    return {
      bot: botRepository.buildModel(insertedBotRow),
      backLog
    }
  })
}

/**
 * Enable Bot
 */
export const enableBot: EnableBot = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const userRow = await userRepository.selectRowById(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError({ request })
    }

    const botRow = await botRepository.selectRowByIdUserId(
      trx,
      request.botId,
      userRow.id,
      true // writeLock
    )

    if (botRow === undefined) {
      throw new BotNotFoundError({ request })
    }

    if (botRow.is_enabled) {
      return {
        bot: botRepository.buildModel(botRow),
        backLog
      }
    }

    const linkedCategoryRow = await categoryRepository.selectRowByBotId(
      trx,
      botRow.id,
    )

    if (linkedCategoryRow !== undefined) {
      throw new BotIsLinkedError({ request })
    }

    botRow.is_linked = false
    botRow.is_enabled = true

    const updatedBotRow = await botRepository.updateRowState(
      trx,
      botRow.id,
      botRow.is_linked,
      botRow.is_enabled
    )

    const botLogRow = await botLogRepository.insertRow(
      trx,
      updatedBotRow.id,
      'enable_bot',
      updatedBotRow.is_linked,
      updatedBotRow.is_enabled,
      request.data
    )

    backLog.push(botLogRepository.buildNotify(botLogRow))

    return {
      bot: botRepository.buildModel(updatedBotRow),
      backLog
    }
  })
}

/**
 * Disable Bot
 */
export const disableBot: DisableBot = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const backLog: Notify[] = []

    const userRow = await userRepository.selectRowById(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError({ request })
    }

    const botRow = await botRepository.selectRowByIdUserId(
      trx,
      request.botId,
      userRow.id,
      true // writeLock
    )

    if (botRow === undefined) {
      throw new BotNotFoundError({ request })
    }

    if (!botRow.is_enabled) {
      return {
        bot: botRepository.buildModel(botRow),
        backLog
      }
    }

    const linkedCategoryRow = await categoryRepository.selectRowByBotId(
      trx,
      botRow.id,
    )

    if (linkedCategoryRow !== undefined) {
      throw new BotIsLinkedError({ request })
    }

    botRow.is_linked = false
    botRow.is_enabled = false

    const updatedBotRow = await botRepository.updateRowState(
      trx,
      botRow.id,
      botRow.is_linked,
      botRow.is_enabled
    )

    const botLogRow = await botLogRepository.insertRow(
      trx,
      updatedBotRow.id,
      'disable_bot',
      updatedBotRow.is_linked,
      updatedBotRow.is_enabled,
      request.data
    )

    backLog.push(botLogRepository.buildNotify(botLogRow))

    return {
      bot: botRepository.buildModel(updatedBotRow),
      backLog
    }
  })
}

/**
 * List Bots
 */
export const listBots: ListBots = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const userRow = await userRepository.selectRowById(trx, request.userId)

    if (userRow === undefined) {
      throw new UserNotFoundError({ request })
    }

    const botRows = await botRepository.selectRowsByUserId(trx, userRow.id)

    return {
      bots: botRepository.buildCollection(botRows)
    }
  })
}

/**
 * Produce Bots
 */
export const produceBots: ProduceBots = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    const botRows = await botRepository.selectRowsProduce(trx, request.limit)

    const updatedBotRows = await botRepository.updateRowsProduce(
      trx,
      botRows.map((botRow) => botRow.id)
    )

    return {
      bots: botRepository.buildCollection(updatedBotRows)
    }
  })
}

/**
 * Consume Bot
 */
export const consumeBot: ConsumeBot = async function (db, request) {
  return await db.transaction().execute(async (trx) => {
    let category: Category | undefined = undefined

    const backLog: Notify[] = []

    let modified = false

    const botRow = await botRepository.selectRowById(trx, request.botId, true)

    if (botRow === undefined) {
      throw new BotNotFoundError({ request })
    }

    const userRow = await userRepository.selectRowById(trx, botRow.user_id)

    if (userRow === undefined) {
      throw new UserNotFoundError({ request }, 100)
    }

    const linkedCategoryRow = await categoryRepository.selectRowByBotId(trx, botRow.id)

    if (linkedCategoryRow !== undefined) {
      category = categoryRepository.buildModel(linkedCategoryRow)

      if (!botRow.is_linked) {
        botRow.is_linked = true

        modified = true
      }

      if (!botRow.is_enabled) {
        botRow.is_enabled = true

        modified = true
      }
    } else {
      if (botRow.is_linked) {
        botRow.is_linked = false

        modified = true
      }
    }

    if (!modified) {
      return {
        bot: botRepository.buildModel(botRow),
        user: userRepository.buildModel(userRow),
        category,
        backLog
      }
    }

    const updatedBotRow = await botRepository.updateRowState(
      trx,
      botRow.id,
      botRow.is_linked,
      botRow.is_enabled,
    )

    const botLogRow = await botLogRepository.insertRow(
      trx,
      updatedBotRow.id,
      'consume_bot',
      updatedBotRow.is_linked,
      updatedBotRow.is_enabled,
      request.data
    )

    backLog.push(botLogRepository.buildNotify(botLogRow))

    return {
      bot: botRepository.buildModel(updatedBotRow),
      user: userRepository.buildModel(userRow),
      category,
      backLog
    }
  })
}
