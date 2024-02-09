import { Bot, GrammyError, HttpError, session } from 'grammy'
import { RedisAdapter } from '@grammyjs/storage-redis'
import { loggerService } from '@avito-speculant/logger'
import {
  DatabaseError,
  databaseService,
  AuthorizeUserRequest,
  userService
} from '@avito-speculant/database'
import { redisService } from '@avito-speculant/redis'
import { Config, config } from './config.js'
import { BotContext } from './context.js'

async function bootstrap(): Promise<void> {
  const loggerOptions = loggerService.getLoggerOptions<Config>(config)
  const logger = loggerService.initLogger(loggerOptions)

  const databaseConfig = databaseService.getDatabaseConfig<Config>(config)
  const db = databaseService.initDatabase(databaseConfig, logger)
  const pubSub = databaseService.initPubSub(databaseConfig, logger)

  const redisOptions = redisService.getRedisOptions<Config>(config)
  const redis = redisService.initRedis(redisOptions, logger)

  const storage = new RedisAdapter({ instance: redis, ttl: 10 })

  const bot = new Bot<BotContext>(config.BOT_TOKEN)

  /*
  bot.use(session({
    storage
  }))
  */

  bot.use(async (ctx, next) => {
    if (ctx.from) {
      const authorizeUserResponse = await userService.authorizeUser(
        db,
        pubSub,
        {
          tgFromId: ctx.from.id.toString(),
          data: {
            from: ctx.from
          }
        }
      )

      ctx.user = authorizeUserResponse.user

      await next()
    }
  })

  bot.command('start', async (ctx) => {
    logger.info(ctx.user, `User authorized for start`)

    await ctx.reply(`blablabla: ${ctx.user.status}`)
  })

  //pubSub.channels.on('user', (payload) => {
  //  logger.info(payload, `Lisen on user channel!!!!!!!!!!!!`)
  //})

  bot.catch(async (botError) => {
    const { error, ctx } = botError

    if (error instanceof GrammyError) {
      logger.error(error, `Grammy error`)
    } else if (error instanceof HttpError) {
      logger.error(error, `HTTP error`)
    } else if (error instanceof DatabaseError) {
      logger.error(error, `Database error`)
    } else if (error instanceof Error) {
      logger.error(error, `Internal error`)
    } else {
      logger.error(error, `Unknown error`)
    }
  })

  bot.start()
}

bootstrap()
