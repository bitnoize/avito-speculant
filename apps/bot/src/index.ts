import { Bot, GrammyError, HttpError, session } from 'grammy'
import { RedisAdapter } from '@grammyjs/storage-redis'
import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import { AuthorizeUserRequest, databaseService, userService } from '@avito-speculant/database'
import { redisService } from '@avito-speculant/redis'
import { Config } from './bot.js'
import { configSchema } from './bot.schema.js'
import { BotContext } from './context.js'

async function bootstrap(): Promise<void> {
  const config = configService.initConfig<Config>(configSchema)

  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
  const db = databaseService.initDatabase(databaseConfig, logger)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)
  const pubSub = redisService.initPubSub(redisOptions, logger)

  const storage = new RedisAdapter({ instance: redis, ttl: 10 })

  const bot = new Bot<BotContext>(config.BOT_TOKEN)

  /*
  bot.use(session({
    storage
  }))
  */

  bot.use(async (ctx, next) => {
    if (ctx.from) {
      const { user, subscription, backLog } = await userService.authorizeUser(db, {
        tgFromId: ctx.from.id.toString(),
        data: {
          from: ctx.from,
          message: `Authorize user via Bot`
        }
      })

      ctx.user = user
      ctx.subscription = subscription

      await redisService.publishBackLog(pubSub, backLog)

      await next()
    }
  })

  bot.command('start', async (ctx) => {
    await ctx.reply(`user isPaid: ${ctx.user.isPaid}`)
  })

  bot.catch(async (botError) => {
    const { error, ctx } = botError

    if (error instanceof GrammyError) {
      logger.error(error, `Grammy error`)
    } else if (error instanceof HttpError) {
      logger.error(error, `HTTP error`)
    } else if (error instanceof Error) {
      logger.error(error, `Internal error`)
    } else {
      logger.error(error, `Unknown error`)
    }
  })

  bot.start()
}

bootstrap()
