import { Bot } from 'grammy'
import { getLoggerOptions, initLogger } from '@avito-speculant/logger'
import {
  getDatabaseConfig,
  initDatabase,
  userService,
  CreateUserRequest
} from '@avito-speculant/database'
import { Config, config } from './config.js'

async function bootstrap(): Promise<void> {
  const loggerOptions = getLoggerOptions<Config>(config)
  const logger = initLogger(loggerOptions)

  const databaseConfig = getDatabaseConfig<Config>(config)
  const db = initDatabase(databaseConfig, logger)

  const bot = new Bot(config.BOT_TOKEN)

  bot.command('start', (ctx) => ctx.reply(`blablabla`))

  bot.start()

  /*
  const body: CreateUserRequest = {
    tgFromId: '1020',
    firstName: 'Foo',
    lastName: 'Bar',
    //username: null,
    languageCode: 'ru'
  }

  const result = await db.transaction().execute(async (trx) => {
    return userService.createUser(trx, body)
  })

  logger.info(result, `Created user`)
  */

  //await db.destroy()
}

bootstrap()
