import Fastify from 'fastify'
import { Bot, GrammyError, HttpError, session, webhookCallback } from 'grammy'
import { RedisAdapter } from '@grammyjs/storage-redis'
import { configService } from '@avito-speculant/config'
import { loggerService } from '@avito-speculant/logger'
import {
  AuthorizeUserRequest,
  databaseService,
  userService,
  planService
} from '@avito-speculant/database'
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
      const { user, subscription, plan, backLog } = await userService.authorizeUser(db, {
        tgFromId: ctx.from.id.toString(),
        data: {
          from: ctx.from,
          message: `Authorize user via Bot`
        }
      })

      ctx.user = user

      if (user.isPaid) {
        if (subscription === undefined) {
          throw new Error(`subscription`)
        }

        if (plan === undefined) {
          throw new Error(`plan`)
        }

        ctx.subscription = subscription
        ctx.plan = plan
      }

      await redisService.publishBackLog(pubSub, backLog)

      await next()
    }
  })

  bot.command('start', async (ctx) => {
    await ctx.reply(`user isPaid: ${ctx.user.isPaid}`)
  })

  bot.on('message:photo', async (ctx) => {
    console.log(ctx.message)
  })

  bot.catch(async (botError) => {
    const { error, ctx } = botError

    if (error instanceof GrammyError) {
      logger.error(error, `Grammy error`)
    } else if (error instanceof HttpError) {
      logger.error(error, `HTTP error`)
    } else {
      logger.error(error, `Internal error`)
    }
  })

  bot.start()

  const server = Fastify({ logger })

  server.setErrorHandler(async (error, request, response) => {
    logger.error(error)

    await response.status(500).send({
      code: 100,
      error: 'Internal server error'
    })
  })

  server.get('/plans', async function (request, reply) {
    try {
      const { plans } = await planService.listPlans(db)

      return { plans }
    } catch (error) {
      return {
        code: 100,
        message: 'Internal server error'
      }
    }
  })

  server.post(`/${bot.token}`, webhookCallback(bot, 'fastify'))

  await server.listen({ port: 3000 })
}

bootstrap()
